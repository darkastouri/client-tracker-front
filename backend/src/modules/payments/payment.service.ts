import { Injectable } from "@nestjs/common"
import type { Kysely } from "kysely"
import type { Database } from "../../schema"
import type { ClientService } from "../clients/client.service"

@Injectable()
export class PaymentService {
  constructor(
    private db: Kysely<Database>,
    private clientService: ClientService,
  ) {}

  async deferPayment(paymentId: number, deferredDays: number) {
    await this.db.transaction().execute(async (trx) => {
      const payment = await trx
        .selectFrom("payments")
        .where("id", "=", paymentId)
        .select(["id", "client_id", "due_date", "status"])
        .executeTakeFirst()

      if (!payment) throw new Error("Payment not found")

      // Calculate score penalty based on deferred days
      const scorePenalty = -1 * Math.min(deferredDays, 30) // Max penalty of -30 points

      // Update payment
      await trx
        .updateTable("payments")
        .set({
          status: "deferred",
          due_date: this.db.fn.date("add_days", payment.due_date, deferredDays),
          deferred_days: deferredDays,
          updated_at: new Date(),
        })
        .where("id", "=", paymentId)
        .execute()

      // Log status change
      await trx
        .insertInto("payment_history")
        .values({
          payment_id: paymentId,
          previous_status: payment.status,
          new_status: "deferred",
          score_change: scorePenalty,
          notes: `Payment deferred for ${deferredDays} days`,
          created_at: new Date(),
        })
        .execute()

      // Update client score
      await this.clientService.updateClientScore(
        payment.client_id,
        scorePenalty,
        `Payment deferred for ${deferredDays} days`,
      )
    })
  }

  async abandonPayment(paymentId: number) {
    await this.db.transaction().execute(async (trx) => {
      const payment = await trx
        .selectFrom("payments")
        .where("id", "=", paymentId)
        .select(["id", "client_id", "status"])
        .executeTakeFirst()

      if (!payment) throw new Error("Payment not found")

      const scorePenalty = -50 // Major penalty for abandoning payment

      // Update payment
      await trx
        .updateTable("payments")
        .set({
          status: "abandoned",
          updated_at: new Date(),
        })
        .where("id", "=", paymentId)
        .execute()

      // Log status change
      await trx
        .insertInto("payment_history")
        .values({
          payment_id: paymentId,
          previous_status: payment.status,
          new_status: "abandoned",
          score_change: scorePenalty,
          notes: "Payment abandoned",
          created_at: new Date(),
        })
        .execute()

      // Update client score
      await this.clientService.updateClientScore(payment.client_id, scorePenalty, "Payment abandoned")
    })
  }

  async completePayment(paymentId: number, amount: number) {
    await this.db.transaction().execute(async (trx) => {
      const payment = await trx
        .selectFrom("payments")
        .where("id", "=", paymentId)
        .select(["id", "client_id", "status", "amount", "due_date"])
        .executeTakeFirst()

      if (!payment) throw new Error("Payment not found")

      // Calculate score bonus
      let scoreBonus = 10 // Base bonus for on-time payment
      const now = new Date()

      // Extra bonus for early payment
      if (now < new Date(payment.due_date)) {
        scoreBonus += 5
      }

      // Extra bonus for paying more than expected
      if (amount > payment.amount) {
        scoreBonus += 5
      }

      // Update payment
      await trx
        .updateTable("payments")
        .set({
          status: "completed",
          paid_date: now,
          updated_at: now,
        })
        .where("id", "=", paymentId)
        .execute()

      // Log status change
      await trx
        .insertInto("payment_history")
        .values({
          payment_id: paymentId,
          previous_status: payment.status,
          new_status: "completed",
          score_change: scoreBonus,
          notes: `Payment completed with amount ${amount}`,
          created_at: now,
        })
        .execute()

      // Update client score
      await this.clientService.updateClientScore(payment.client_id, scoreBonus, `Payment completed with bonus`)
    })
  }

  async checkOutstandingPayments() {
    const outstandingPayments = await this.db
      .selectFrom("payments")
      .where("status", "=", "scheduled")
      .where("due_date", "<", new Date())
      .select(["id", "client_id"])
      .execute()

    for (const payment of outstandingPayments) {
      await this.db.transaction().execute(async (trx) => {
        // Update payment status
        await trx
          .updateTable("payments")
          .set({
            status: "outstanding",
            updated_at: new Date(),
          })
          .where("id", "=", payment.id)
          .execute()

        // Log status change
        await trx
          .insertInto("payment_history")
          .values({
            payment_id: payment.id,
            previous_status: "scheduled",
            new_status: "outstanding",
            score_change: -20,
            notes: "Payment marked as outstanding",
            created_at: new Date(),
          })
          .execute()

        // Update client score
        await this.clientService.updateClientScore(payment.client_id, -20, "Payment marked as outstanding")
      })
    }
  }
}
