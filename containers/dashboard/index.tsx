import { DailyProgress } from "@/components/DailyProgress"
import { MonthlyLimits } from "@/components/MonthlyLimits"
import { ActivityHistory } from "@/components/ActivityHistory"

interface DashboardContainerProps {
  dailyProgressData: {
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
  monthlyLimitsData: {
    paid: {
      percentage: number
      amount: number
    }
    unpaid: {
      percentage: number
      amount: number
    }
  }
  activityHistoryData: {
    id: number
    name: string
    type: "paid" | "refund" | "bought"
    amount: number
    time: string
  }[]
  onViewAllHistory: () => void
}

export function DashboardContainer({
  dailyProgressData,
  monthlyLimitsData,
  activityHistoryData,
  onViewAllHistory,
}: DashboardContainerProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity History */}
        <ActivityHistory activities={activityHistoryData} onViewAll={onViewAllHistory} />

        {/* Daily Progress */}
        <DailyProgress
          amountToGain={dailyProgressData.amountToGain}
          amountTarget={dailyProgressData.amountTarget}
          clientsToPay={dailyProgressData.clientsToPay}
          clientsTarget={dailyProgressData.clientsTarget}
          distribution={dailyProgressData.distribution}
        />
      </div>

      {/* Monthly Limits */}
      <MonthlyLimits paid={monthlyLimitsData.paid} unpaid={monthlyLimitsData.unpaid} />
    </div>
  )
}
