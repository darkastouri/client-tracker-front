"use client"

import { useTranslation } from "@/hooks/useTranslation"
import Link from "next/link"
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowRightIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  DollarSignIcon, 
  UsersIcon, 
  PackageIcon,
  TrendingUpIcon,
  ShoppingCartIcon,
  ClockIcon 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const dailyProgressData = {
  amountToGain: 9000,
  amountTarget: 9000,
  amountCollected: 7200,
  clientsToPay: 10,
  clientsTarget: 10,
  clientsCompleted: 8,
  distribution: [
    { status: "Completed", count: 28, amount: 800, color: "bg-emerald-500" },
    { status: "Scheduled", count: 12, amount: 210, color: "bg-blue-500" },
    { status: "Outstanding", count: 6, amount: 70, color: "bg-amber-500" },
    { status: "Deferred", count: 6, amount: 80, color: "bg-rose-500" },
  ],
}

const monthlyLimitsData = {
  paid: {
    percentage: 72,
    amount: 12500,
  },
  unpaid: {
    percentage: 28,
    amount: 4800,
  },
}

const activityHistoryData = [
  {
    id: 1,
    name: "Ahmed Mohamed",
    avatar: "/placeholder.svg",
    type: "paid",
    amount: 150,
    time: "10:30 AM",
  },
  {
    id: 2,
    name: "Fatima Ben Ali",
    avatar: "/placeholder.svg",
    type: "refund",
    amount: 75,
    time: "9:45 AM",
  },
  {
    id: 3,
    name: "Toumi Naima",
    avatar: "/placeholder.svg",
    type: "bought",
    amount: 200,
    time: "Yesterday",
  },
  {
    id: 4,
    name: "Bouzomita Ahmed",
    avatar: "/placeholder.svg",
    type: "paid",
    amount: 120,
    time: "Yesterday",
  },
]

const recentOrdersData = [
  {
    id: "ORD-7652",
    customer: "John Doe",
    products: 3,
    total: 180.99,
    status: "completed",
    date: "20 min ago"
  },
  {
    id: "ORD-7651",
    customer: "Sarah Smith",
    products: 1,
    total: 49.99,
    status: "processing",
    date: "2 hours ago"
  },
  {
    id: "ORD-7650",
    customer: "Mike Johnson",
    products: 5,
    total: 299.95,
    status: "pending",
    date: "Yesterday"
  },
  {
    id: "ORD-7649",
    customer: "Emily Garcia",
    products: 2,
    total: 120.00,
    status: "completed",
    date: "Yesterday"
  },
]

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("dashboard")}</h1>
          <p className="page-description">{t("dashboardDescription")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="font-medium">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {t("Today")}
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Total Collected")}
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dailyProgressData.amountCollected).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((dailyProgressData.amountCollected / dailyProgressData.amountTarget) * 100)}% {t("of monthly target")}
            </p>
            <div className="mt-3">
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Clients")}
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyProgressData.clientsCompleted}/{dailyProgressData.clientsTarget}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((dailyProgressData.clientsCompleted / dailyProgressData.clientsTarget) * 100)}% {t("completed")}
            </p>
            <div className="flex items-center mt-4 space-x-2">
              <div className="flex-1 h-2 rounded-full bg-primary-foreground">
                <div 
                  className="h-full rounded-full bg-primary" 
                  style={{ width: `${(dailyProgressData.clientsCompleted / dailyProgressData.clientsTarget) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Collection Rate")}
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.8%</div>
            <div className="flex items-center pt-1">
              <ArrowUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-xs font-medium text-emerald-500">+2.1%</span>
              <span className="text-xs text-muted-foreground ml-1">{t("from last month")}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {dailyProgressData.distribution.map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-full h-1 rounded-full ${item.color}`}></div>
                  <span className="text-xs mt-1 text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Outstanding")}
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyLimitsData.unpaid.amount.toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <ArrowDownIcon className="h-4 w-4 text-rose-500 mr-1" />
              <span className="text-xs font-medium text-rose-500">6</span>
              <span className="text-xs text-muted-foreground ml-1">{t("payments overdue")}</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {Array(7).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-8 rounded-sm ${i < 2 ? 'bg-rose-500/20' : 'bg-muted/30'} flex items-center justify-center`}
                >
                  <span className="text-[10px] text-muted-foreground">{i+1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Payment Distribution */}
        <Card className="lg:col-span-3 dashboard-card">
          <CardHeader>
            <CardTitle>{t("paymentDistribution")}</CardTitle>
            <CardDescription>{t("Track your daily collection progress")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                {dailyProgressData.distribution.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="flex items-center">
                      <div className={`mr-2 h-3 w-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm">{t(item.status.toLowerCase())}</span>
                    </div>
                    <span className="font-medium">${item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="relative flex aspect-square items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold">80%</span>
                    <span className="text-xs text-muted-foreground">{t("collection rate")}</span>
                  </div>
                </div>
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="stroke-rose-500 stroke-[8] fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray={`${6 * 2.51} ${251.2 - 6 * 2.51}`}
                    strokeLinecap="round"
                  />
                  <circle
                    className="stroke-amber-500 stroke-[8] fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray={`${6 * 2.51} ${251.2 - 6 * 2.51}`}
                    strokeDashoffset={-6 * 2.51}
                    strokeLinecap="round"
                  />
                  <circle
                    className="stroke-blue-500 stroke-[8] fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray={`${12 * 2.51} ${251.2 - 12 * 2.51}`}
                    strokeDashoffset={-(6 * 2.51) * 2}
                    strokeLinecap="round"
                  />
                  <circle
                    className="stroke-emerald-500 stroke-[8] fill-none"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray={`${28 * 2.51} ${251.2 - 28 * 2.51}`}
                    strokeDashoffset={-(6 * 2.51) * 2 - (12 * 2.51)}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="lg:col-span-4 dashboard-card">
          <Tabs defaultValue="activity">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>{t("Recent Activity")}</CardTitle>
                <TabsList className="grid grid-cols-2 h-8">
                  <TabsTrigger value="activity" className="text-xs">{t("Activity")}</TabsTrigger>
                  <TabsTrigger value="orders" className="text-xs">{t("Orders")}</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="activity" className="space-y-0 mt-0">
                <div className="space-y-4">
                  {activityHistoryData.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={activity.avatar} alt={activity.name} />
                        <AvatarFallback>{activity.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === "paid" ? (
                            <span>
                              {t("Payment of")} <span className="text-foreground font-medium">${activity.amount}</span>
                            </span>
                          ) : activity.type === "refund" ? (
                            <span>
                              {t("Refund of")} <span className="text-foreground font-medium">${activity.amount}</span>
                            </span>
                          ) : (
                            <span>
                              {t("Order of")} <span className="text-foreground font-medium">${activity.amount}</span>
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 px-0 w-full">
                  {t("View All Activity")} <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-0 mt-0">
                <div className="space-y-4">
                  {recentOrdersData.map((order) => (
                    <div key={order.id} className="flex items-center">
                      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                        <ShoppingCartIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.id} - {order.products} {t("items")}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 px-0 w-full">
                  {t("View All Orders")} <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Limits */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t("Payment Summary")}</CardTitle>
            <CardDescription>{t("For the current month")}</CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="text-sm font-medium">{t("paid")}</div>
                <div className="text-sm">
                  ${monthlyLimitsData.paid.amount.toLocaleString()} 
                  <span className="text-muted-foreground ml-1">({monthlyLimitsData.paid.percentage}%)</span>
                </div>
              </div>
              <div>
                <Progress value={monthlyLimitsData.paid.percentage} className="h-2" />
              </div>
              <div className="flex justify-between">
                <div className="text-sm font-medium">{t("unpaid")}</div>
                <div className="text-sm">
                  ${monthlyLimitsData.unpaid.amount.toLocaleString()}
                  <span className="text-muted-foreground ml-1">({monthlyLimitsData.unpaid.percentage}%)</span>
                </div>
              </div>
              <div>
                <Progress value={monthlyLimitsData.unpaid.percentage} className="h-2 bg-muted" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/payments" className="text-sm text-primary hover:underline">
              {t("View All Payments")}
            </Link>
          </CardFooter>
        </Card>

        {/* High Value Clients */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t("Top Clients")}</CardTitle>
            <CardDescription>{t("Your highest value clients")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Ahmed Mohamed</p>
                  <div className="mt-1 flex items-center">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div className="h-full rounded-full bg-primary" style={{ width: '85%' }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">85%</span>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <p className="text-sm font-medium">$3,400</p>
                  <p className="text-xs text-muted-foreground">$4,000</p>
                </div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>FB</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Fatima Ben Ali</p>
                  <div className="mt-1 flex items-center">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div className="h-full rounded-full bg-primary" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">70%</span>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <p className="text-sm font-medium">$2,100</p>
                  <p className="text-xs text-muted-foreground">$3,000</p>
                </div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>TN</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Toumi Naima</p>
                  <div className="mt-1 flex items-center">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div className="h-full rounded-full bg-primary" style={{ width: '60%' }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">60%</span>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <p className="text-sm font-medium">$1,500</p>
                  <p className="text-xs text-muted-foreground">$2,500</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/clients" className="text-sm text-primary hover:underline">
              {t("View All Clients")}
            </Link>
          </CardFooter>
        </Card>

        {/* Inventory Status */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t("Inventory Status")}</CardTitle>
            <CardDescription>{t("Stock levels for top products")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <PackageIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm font-medium">Wireless Earbuds</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400">
                    {t("low stock")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: '15%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">8/50</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <PackageIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm font-medium">Premium Leather Wallet</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400">
                    {t("normal stock")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '65%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">32/50</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <PackageIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm font-medium">Stainless Steel Water Bottle</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400">
                    {t("normal stock")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '45%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium">23/50</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/products" className="text-sm text-primary hover:underline">
              {t("View All Products")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
