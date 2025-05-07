"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/hooks/useTranslation"

interface ActivityItem {
  id: number
  name: string
  type: "paid" | "refund" | "bought"
  amount: number
  time: string
}

interface ActivityHistoryProps {
  activities: ActivityItem[]
  onViewAll: () => void
}

export function ActivityHistory({ activities, onViewAll }: ActivityHistoryProps) {
  const { t } = useTranslation()

  const getTypeColor = (type: string) => {
    switch (type) {
      case "paid":
        return "text-green-500"
      case "refund":
        return "text-amber-500"
      case "bought":
        return "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("activityHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.name}</p>
                <p className={`text-sm ${getTypeColor(activity.type)}`}>{t(activity.type)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${activity.amount}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewAll}>
          {t("viewHistory")}
        </Button>
      </CardFooter>
    </Card>
  )
}
