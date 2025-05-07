"use client"

import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { Badge } from "@/components/ui/badge"

interface InstallmentCardProps {
  id: number
  clientId: number
  clientName: string
  amount: number
  dueDate: string
  status: string
  progress: number
  onClick: (payment: any) => void
}

export function InstallmentCard({
  id,
  clientId,
  clientName,
  amount,
  dueDate,
  status,
  progress,
  onClick,
}: InstallmentCardProps) {
  const { t } = useTranslation()
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled":
        return "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300 border-green-200 dark:border-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "deferred":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      case "outstanding":
        return "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300 border-red-200 dark:border-red-800"
      case "abandoned":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300 border-gray-200 dark:border-gray-700"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div 
      className="payment-card p-4 mb-3 bg-card rounded-lg border dark:border-gray-800 hover:bg-muted/50 dark:hover:bg-gray-800/10 cursor-pointer"
      onClick={() => onClick({ id, clientId, clientName, amount, dueDate, status, progress })}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="font-medium">{clientName}</div>
          <Badge variant="outline" className={getStatusColor(status)}>
            {t(status)}
          </Badge>
        </div>
        
        <div className="text-lg font-medium">dt {amount}</div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(dueDate), "PPP")}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-2 w-full rounded-full bg-muted dark:bg-gray-800">
            <div 
              className="h-full rounded-full bg-primary" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      </div>
    </div>
  )
} 