export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  provider_id: number
  created_at: Date
  updated_at: Date
  image?: string
  quantity?: number
  minQuantity?: number
  maxQuantity?: number
  provider?: string
  salesVelocity?: "high" | "medium" | "low"
  totalSold?: number
  lastRestocked?: string
  category?: string
  tags?: string[]
  stats?: {
    lastMonthSales: number
    averageMonthlySales: number
    profitMargin: number
  }
}
