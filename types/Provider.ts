export interface Provider {
  id: number
  name: string
  email: string
  phone: string | null
  status: "active" | "inactive"
  created_at: Date
  updated_at: Date
}
