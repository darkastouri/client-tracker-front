export interface Payment {
  id: number
  order_id: number
  client_id?: number
  amount: number
  status: "scheduled" | "completed" | "deferred" | "abandoned" | "outstanding" | "settled"
  due_date: Date
  paid_date: Date | null
  deferred_days: number
  created_at: Date
  updated_at: Date
  progress?: number
  client?: {
    id?: number
    name: string
    email?: string
  }
}

export interface PaymentHistory {
  id: number
  payment_id: number
  previous_status: string
  new_status: string
  score_change: number
  notes: string | null
  created_at: Date
}
