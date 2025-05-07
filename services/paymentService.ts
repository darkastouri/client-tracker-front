import type { Payment } from "@/types/Payment"

export function calculatePaymentStatus(payment: Payment): string {
  const now = new Date()
  const dueDate = new Date(payment.due_date)

  if (payment.status === "completed") {
    return "completed"
  }

  if (payment.status === "deferred") {
    return "deferred"
  }

  if (payment.status === "abandoned") {
    return "abandoned"
  }

  if (now > dueDate) {
    return "overdue"
  }

  return "scheduled"
}

export function calculateClientScore(
  completedPayments: number,
  deferredPayments: number,
  abandonedPayments: number,
  outstandingPayments: number,
): number {
  // Base score
  let score = 70

  // Add points for completed payments
  score += completedPayments * 5

  // Subtract points for deferred payments
  score -= deferredPayments * 2

  // Subtract points for abandoned payments
  score -= abandonedPayments * 10

  // Subtract points for outstanding payments
  score -= outstandingPayments * 5

  // Cap the score between 0 and 100
  return Math.max(0, Math.min(100, score))
}
