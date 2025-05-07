"use client"

import { useState } from "react"
import { Calendar, CreditCard, DollarSign, LineChart, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data
const paymentStats = {
  totalCollected: 4550,
  totalPending: 2345,
  totalOverdue: 890,
  collectionRate: 78.5,
  monthlyTarget: 9000,
  dailyTarget: 300,
}

const recentPayments = [
  {
    id: 1,
    clientName: "Asma Jomaa",
    amount: 150,
    status: "completed",
    date: "2024-02-28",
    dueDate: "2024-02-28",
  },
  {
    id: 2,
    clientName: "Bouzomita Ahmed",
    amount: 200,
    status: "deferred",
    date: "2024-02-27",
    dueDate: "2024-03-05",
  },
  {
    id: 3,
    clientName: "Toumi Naima",
    amount: 75,
    status: "outstanding",
    date: "2024-02-25",
    dueDate: "2024-02-26",
  },
]

const dailyProgress = {
  target: 300,
  current: 250,
  completed: 5,
  pending: 3,
  distribution: [
    { status: "Completed", count: 28, amount: 800 },
    { status: "Scheduled", count: 12, amount: 210 },
    { status: "Outstanding", count: 6, amount: 70 },
    { status: "Deferred", count: 6, amount: 80 },
  ],
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500",
  scheduled: "bg-amber-500",
  deferred: "bg-yellow-500",
  outstanding: "bg-red-500",
  abandoned: "bg-purple-500",
}

const statusTextColors: Record<string, string> = {
  completed: "text-green-500",
  scheduled: "text-amber-500",
  deferred: "text-yellow-500",
  outstanding: "text-red-500",
  abandoned: "text-purple-500",
}

export default function FinancesPage() {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("today")
  const [view, setView] = useState<"all" | "pending" | "completed">("all")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-muted-foreground">Track your payments and daily progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={dateRange} onValueChange={(value: "today" | "week" | "month") => setDateRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">dt {paymentStats.totalCollected.toLocaleString()}</div>
            <div className="flex items-center text-sm text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +20.1% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">dt {paymentStats.totalPending.toLocaleString()}</div>
            <div className="flex items-center text-sm text-amber-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              {paymentStats.collectionRate}% collection rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">dt {paymentStats.totalOverdue.toLocaleString()}</div>
            <div className="flex items-center text-sm text-red-500">
              <ArrowDownRight className="mr-1 h-4 w-4" />5 payments overdue
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">dt {paymentStats.monthlyTarget.toLocaleString()}</div>
            <div className="mt-2">
              <Progress value={50.5} className="h-2" />
              <p className="mt-1 text-sm text-muted-foreground">50.5% achieved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>Track your daily collection progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Progress Ring */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount Collected</p>
                  <p className="text-2xl font-bold">
                    dt {dailyProgress.current}{" "}
                    <span className="text-sm text-muted-foreground">/ dt {dailyProgress.target}</span>
                  </p>
                </div>
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
                      className="stroke-primary stroke-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - dailyProgress.current / dailyProgress.target)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-lg font-bold">
                      {Math.round((dailyProgress.current / dailyProgress.target) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Distribution */}
              <div className="space-y-4">
                <Label>Payment Distribution</Label>
                <div className="grid gap-2">
                  {dailyProgress.distribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${statusColors[item.status.toLowerCase()]}`} />
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{item.count}</span>
                        <span className="text-sm text-muted-foreground">dt {item.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Tracking */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle>Payment Tracking</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setView(v as typeof view)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{payment.clientName}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${statusTextColors[payment.status]} border-current`}>
                          {payment.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">dt {payment.amount}</p>
                      <p className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Payments
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
