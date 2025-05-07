import type React from "react"
import "./styles.css"

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="payments-layout">{children}</div>
}
