"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/hooks/useTranslation"

interface DailyProgressProps {
  amountToGain: number
  amountTarget: number
  clientsToPay: number
  clientsTarget: number
  distribution: {
    status: string
    count: number
    amount: number
  }[]
}

export function DailyProgress({
  amountToGain,
  amountTarget,
  clientsToPay,
  clientsTarget,
  distribution,
}: DailyProgressProps) {
  const { t } = useTranslation()

  const amountPercentage = (amountToGain / amountTarget) * 100
  const clientsPercentage = (clientsToPay / clientsTarget) * 100

  const statusColors: Record<string, string> = {
    completed: "bg-green-500",
    scheduled: "bg-amber-500",
    deferred: "bg-yellow-500",
    outstanding: "bg-red-500",
    abandoned: "bg-purple-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dailyProgress")}</CardTitle>
        <CardDescription>{t("trackDailyProgress")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Amount to Gain */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("amountToGain")}</span>
              <span className="text-sm font-medium">
                ${amountToGain} / ${amountTarget}
              </span>
            </div>
            <Progress value={amountPercentage} className="h-2" />
          </div>

          {/* Clients to Pay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("clientsToPay")}</span>
              <span className="text-sm font-medium">
                {clientsToPay} / {clientsTarget}
              </span>
            </div>
            <Progress value={clientsPercentage} className="h-2" />
          </div>

          {/* Payment Distribution */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t("paymentDistribution")}</h4>
            <div className="grid gap-2">
              {distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${statusColors[item.status.toLowerCase()]}`} />
                    <span className="text-sm">{t(item.status.toLowerCase())}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-sm text-muted-foreground">${item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
