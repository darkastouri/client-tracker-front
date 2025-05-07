import type { ColumnType } from "kysely"

export interface Database {
  clients: {
    id: ColumnType<number, number, never>
    name: string
    email: string
    phone: string | null
    score: number
    status: "active" | "inactive"
    created_at: ColumnType<Date, Date | string, never>
    updated_at: ColumnType<Date, Date | string, never>
  }
  products: {
    id: ColumnType<number, number, never>
    name: string
    description: string | null
    price: ColumnType<number, number | string, string>
    stock: number
    provider_id: number
    created_at: ColumnType<Date, Date | string, never>
    updated_at: ColumnType<Date, Date | string, never>
  }
  orders: {
    id: ColumnType<number, number, never>
    client_id: number
    total_amount: ColumnType<number, number | string, string>
    status: "pending" | "completed" | "cancelled"
    created_at: ColumnType<Date, Date | string, never>
    updated_at: ColumnType<Date, Date | string, never>
  }
  order_items: {
    id: ColumnType<number, number, never>
    order_id: number
    product_id: number | null
    name: string
    price: ColumnType<number, number | string, string>
    quantity: number
    created_at: ColumnType<Date, Date | string, never>
  }
  payments: {
    id: ColumnType<number, number, never>
    order_id: number
    amount: ColumnType<number, number | string, string>
    status: "scheduled" | "completed" | "deferred" | "abandoned" | "outstanding"
    due_date: ColumnType<Date, Date | string, never>
    paid_date: ColumnType<Date, Date | string, never> | null
    deferred_days: number
    created_at: ColumnType<Date, Date | string, never>
    updated_at: ColumnType<Date, Date | string, never>
  }
  payment_history: {
    id: ColumnType<number, number, never>
    payment_id: number
    previous_status: string
    new_status: string
    score_change: number
    notes: string | null
    created_at: ColumnType<Date, Date | string, never>
  }
  providers: {
    id: ColumnType<number, number, never>
    name: string
    email: string
    phone: string | null
    status: "active" | "inactive"
    created_at: ColumnType<Date, Date | string, never>
    updated_at: ColumnType<Date, Date | string, never>
  }
}
