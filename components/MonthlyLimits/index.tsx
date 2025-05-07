"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/hooks/useTranslation"

interface MonthlyLimitsProps {
  paid: {
    percentage: number
    amount: number
  }
  unpaid: {
    percentage: number
    amount: number
  }
}

export function MonthlyLimits({ paid, unpaid }: MonthlyLimitsProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("monthlyLimits")}</CardTitle>
        <CardDescription>{t("trackMonthlyLimits")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          {/* Paid */}
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-muted stroke-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-green-500 stroke-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - paid.percentage / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-bold">{paid.percentage}%</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium">{t("paid")}</p>
            <p className="text-sm text-muted-foreground">${paid.amount}</p>
          </div>

          {/* Unpaid */}
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-muted stroke-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-amber-500 stroke-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - unpaid.percentage / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-bold">{unpaid.percentage}%</p>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium">{t("unpaid")}</p>
            <p className="text-sm text-muted-foreground">${unpaid.amount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
