import { Injectable } from "@nestjs/common"
import type { Kysely } from "kysely"
import type { Database } from "../../schema"

@Injectable()
export class ClientService {
  constructor(private db: Kysely<Database>) {}

  async updateClientScore(clientId: number, scoreChange: number, reason: string) {
    await this.db.transaction().execute(async (trx) => {
      // Update client score
      const client = await trx
        .updateTable("clients")
        .set((eb) => ({
          score: eb("score", "+", scoreChange),
          updated_at: new Date(),
        }))
        .where("id", "=", clientId)
        .returning(["id", "score"])
        .executeTakeFirst()

      // Log the score change
      await trx
        .insertInto("payment_history")
        .values({
          payment_id: 0, // Use 0 for direct score changes
          previous_status: "score_update",
          new_status: "score_update",
          score_change: scoreChange,
          notes: reason,
          created_at: new Date(),
        })
        .execute()
    })
  }

  async getClientPaymentStats(clientId: number) {
    const stats = await this.db
      .selectFrom("payments")
      .where("client_id", "=", clientId)
      .select([
        (eb) => eb.fn.count("id").as("total_payments"),
        (eb) => eb.fn.count("id").where("status", "=", "completed").as("completed_payments"),
        (eb) => eb.fn.count("id").where("status", "=", "deferred").as("deferred_payments"),
        (eb) => eb.fn.count("id").where("status", "=", "abandoned").as("abandoned_payments"),
        (eb) => eb.fn.count("id").where("status", "=", "outstanding").as("outstanding_payments"),
      ])
      .executeTakeFirst()

    return stats
  }
}
