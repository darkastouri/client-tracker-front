export interface OrderItem {
  id: number
  order_id: number
  product_id: number | null
  name: string
  price: number
  quantity: number
  created_at: Date
}

export interface Order {
  id: number
  client_id: number
  total_amount: number
  status: "pending" | "completed" | "cancelled"
  created_at: Date
  updated_at: Date
  items?: OrderItem[]
  client?: {
    name: string
    email: string
  }
}
