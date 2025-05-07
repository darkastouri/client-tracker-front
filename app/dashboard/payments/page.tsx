"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar, ChevronDown, Filter, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/hooks/useTranslation"
import { ClientActionPopup } from "@/components/ClientActionPopup"
import { InstallmentCard } from "@/components/InstallmentCard"
import { useLayoutStore } from "@/store/useLayoutStore"
import { getPayments } from "@/actions/payments"
import { ClientService } from "@/services/clientService"
import { format as formatDate } from 'date-fns'
import type { Payment } from "@/types/Payment"
import "./styles.css"

export default function PaymentsPage() {
  const { t } = useTranslation()
  const { language } = useLayoutStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isClientPopupOpen, setIsClientPopupOpen] = useState(false)
  const [viewType, setViewType] = useState<"table" | "kanban">("table")
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>(formatDate(new Date(), 'yyyy-MM-dd'))
  const [payments, setPayments] = useState<Payment[]>([])

  // Fetch clients for selected day from the API
  useEffect(() => {
    async function fetchClientsByDay() {
      try {
        setLoading(true)
        const response = await ClientService.getClientsByDay(selectedDay)
        
        if (response.success) {
          setClients(response.data.docs)
          setError(null)
        } else {
          setError(response.message || "Failed to load clients")
          setClients([])
        }
      } catch (err) {
        setError("Failed to load clients data")
        console.error("Error fetching clients:", err)
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    fetchClientsByDay()
  }, [selectedDay, isClientPopupOpen])

  // Fetch payments from the API
  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true)
        const data = await getPayments()
        setPayments(data)
        setError(null)
      } catch (err) {
        setError("Failed to load payments data")
        console.error("Error fetching payments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  // Handle client card click
  const handleClientClick = (client: any) => {
    // Format the client data to match what ClientActionPopup expects
    setSelectedClient({
      clientId: client._id,
      clientName: client.fullName,
      amount: client.payment?.amount || 0,
      dueDate: client.payment?.dueDate || new Date().toISOString()
    })
    setIsClientPopupOpen(true)
  }

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const clientName = client.fullName || ""
    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || (client.payment && client.payment.status === selectedStatus)
    return matchesSearch && matchesStatus
  })

  // Sort clients based on selected sort order
  const sortedClients = [...filteredClients].sort((a, b) => {
    const dateA = new Date(a.payment?.dueDate || 0).getTime()
    const dateB = new Date(b.payment?.dueDate || 0).getTime()
    const amountA = a.payment?.amount || 0
    const amountB = b.payment?.amount || 0

    switch (sortOrder) {
      case "newest":
        return dateB - dateA
      case "oldest":
        return dateA - dateB
      case "amount-high":
        return amountB - amountA
      case "amount-low":
        return amountA - amountB
      default:
        return dateB - dateA
    }
  })

  // Group the clients by payment status for both views
  const groupedClients = {
    scheduled: sortedClients.filter(client => client.payment && client.payment.status === "scheduled"),
    deferred: sortedClients.filter(client => client.payment && client.payment.status === "deferred"),
    settled: sortedClients.filter(client => client.payment && (client.payment.status === "settled" || client.payment.status === "completed")),
    outstanding: sortedClients.filter(client => client.payment && client.payment.status === "outstanding"),
    abandoned: sortedClients.filter(client => client.payment && client.payment.status === "abandoned"),
  }

  // Filter payments based on search query and selected status
  const filteredPayments = payments.filter((payment) => {
    // This assumes payment has a clientName property, adjust as needed based on API response
    const clientName = payment.client?.name || ""
    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Sort payments based on selected sort order
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.due_date).getTime()
    const dateB = new Date(b.due_date).getTime()

    switch (sortOrder) {
      case "newest":
        return dateB - dateA
      case "oldest":
        return dateA - dateB
      case "amount-high":
        return b.amount - a.amount
      case "amount-low":
        return a.amount - b.amount
      default:
        return dateB - dateA
    }
  })

  // Group the payments by status for kanban view
  const groupedPayments = {
    scheduled: sortedPayments.filter(payment => payment.status === "scheduled"),
    deferred: sortedPayments.filter(payment => payment.status === "deferred"),
    settled: sortedPayments.filter(payment => payment.status === "settled" || payment.status === "completed"),
    outstanding: sortedPayments.filter(payment => payment.status === "outstanding"),
    abandoned: sortedPayments.filter(payment => payment.status === "abandoned"),
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("Payments")}</h1>
        
        <div className="hidden md:flex">
          <Button variant="outline" className="mr-2">
            <ChevronDown className="mr-2 h-4 w-4" />
            {t("Export")}
          </Button>
          
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            {t("Create Payment")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground">
          {t("Track and manage your client payments")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{t("Payment Day")}:</p>
          <Input
            type="date"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-40 md:w-48"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedDay(formatDate(new Date(), 'yyyy-MM-dd'))}
        >
          {t("Today")}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <Tabs defaultValue="table" onValueChange={(value) => setViewType(value as "table" | "kanban")}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder={t("Search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">{t("Search")}</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <TabsList>
                <TabsTrigger value="table">
                  <List className="mr-2 h-4 w-4" />
                  {t("Table View")}
                </TabsTrigger>
                <TabsTrigger value="kanban">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {t("Installment View")}
                </TabsTrigger>
              </TabsList>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {t("Filter")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>{t("Filter by Status")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("all")}
                      className={selectedStatus === "all" ? "bg-secondary" : ""}
                    >
                      {t("All")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("scheduled")}
                      className={selectedStatus === "scheduled" ? "bg-secondary" : ""}
                    >
                      {t("scheduled")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("settled")}
                      className={selectedStatus === "settled" ? "bg-secondary" : ""}
                    >
                      {t("settled")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("deferred")}
                      className={selectedStatus === "deferred" ? "bg-secondary" : ""}
                    >
                      {t("deferred")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("outstanding")}
                      className={selectedStatus === "outstanding" ? "bg-secondary" : ""}
                    >
                      {t("outstanding")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("abandoned")}
                      className={selectedStatus === "abandoned" ? "bg-secondary" : ""}
                    >
                      {t("abandoned")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {t("Sort")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>{t("Sort by")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("newest")}
                      className={sortOrder === "newest" ? "bg-secondary" : ""}
                    >
                      {t("Newest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("oldest")}
                      className={sortOrder === "oldest" ? "bg-secondary" : ""}
                    >
                      {t("Oldest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("amount-high")}
                      className={sortOrder === "amount-high" ? "bg-secondary" : ""}
                    >
                      {t("Amount (High to Low)")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("amount-low")}
                      className={sortOrder === "amount-low" ? "bg-secondary" : ""}
                    >
                      {t("Amount (Low to High)")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center p-8">
              <p>{t("Loading payments...")}</p>
            </div>
          )}

          {error && (
            <div className="flex justify-center p-8 text-red-500">
              <p>{error}</p>
            </div>
          )}

          <TabsContent value="table">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
                <CardDescription>
                  {filteredClients.length} {t("clients")}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {Object.entries(groupedClients).map(([status, statusClients]) => (
                  statusClients.length > 0 && (
                    <div key={status} className="mb-6">
                      <h3 className={`px-6 py-2 font-medium text-sm ${
                        status === "scheduled"
                          ? "text-blue-700 dark:text-blue-400"
                          : status === "settled" || status === "completed"
                          ? "text-green-700 dark:text-green-400"
                          : status === "deferred"
                          ? "text-amber-700 dark:text-amber-400"
                          : status === "outstanding"
                          ? "text-red-700 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-400"
                      }`}>
                        {t(status)} ({statusClients.length})
                      </h3>
                      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statusClients.map(client => (
                          <Card 
                            key={client._id} 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              status === "scheduled"
                                ? "border-blue-200 dark:border-blue-800"
                                : status === "settled" || status === "completed"
                                ? "border-green-200 dark:border-green-800"
                                : status === "deferred"
                                ? "border-amber-200 dark:border-amber-800"
                                : status === "outstanding"
                                ? "border-red-200 dark:border-red-800"
                                : "border-gray-200 dark:border-gray-800"
                            }`}
                            onClick={() => handleClientClick(client)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  {client.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-medium">{client.fullName}</h4>
                                  <p className="text-sm text-muted-foreground">{client.phoneNum}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">{t("Due Date")}</p>
                                  <p className="text-sm font-medium">
                                    {client.payment?.dueDate ? format(
                                      new Date(client.payment.dueDate), 
                                      language === 'ar' ? 'dd/MM/yyyy' : 'MMM dd, yyyy'
                                    ) : ''}
                                  </p>
                                </div>
                                <div className="space-y-1 text-right">
                                  <p className="text-xs text-muted-foreground">{t("Amount")}</p>
                                  <p className="text-sm font-medium">dt {client.payment?.amount || 0}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>{t("Progress")}</span>
                                  <span>{Math.round((client.paidAmount / client.totalAmount) * 100 || 0)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted dark:bg-gray-800">
                                  <div 
                                    className={`h-full rounded-full ${
                                      status === "scheduled"
                                        ? "bg-blue-500"
                                        : status === "settled" || status === "completed"
                                        ? "bg-green-500"
                                        : status === "deferred"
                                        ? "bg-amber-500"
                                        : status === "outstanding"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                                    style={{ width: `${(client.paidAmount / client.totalAmount) * 100 || 0}%` }} 
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kanban">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Scheduled Column */}
              <Card className="bg-blue-50/50 dark:bg-blue-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-700 dark:text-blue-400">{t("scheduled")}</CardTitle>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
                      {groupedClients.scheduled.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="kanban-column">
                  {groupedClients.scheduled.map((client) => (
                    <InstallmentCard
                      key={client._id}
                      id={client._id}
                      clientId={client._id}
                      clientName={client.fullName}
                      amount={client.payment?.amount || 0}
                      dueDate={client.payment?.dueDate || ""}
                      status={client.payment?.status || "scheduled"}
                      progress={Math.round((client.paidAmount / client.totalAmount) * 100 || 0)}
                      onClick={() => handleClientClick(client)}
                    />
                  ))}
                  {groupedClients.scheduled.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground text-sm py-3">
                      {t("No scheduled payments")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Deferred Column */}
              <Card className="bg-amber-50/50 dark:bg-amber-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-700 dark:text-amber-400">{t("deferred")}</CardTitle>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                      {groupedClients.deferred.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="kanban-column">
                  {groupedClients.deferred.map((client) => (
                    <InstallmentCard
                      key={client._id}
                      id={client._id}
                      clientId={client._id}
                      clientName={client.fullName}
                      amount={client.payment?.amount || 0}
                      dueDate={client.payment?.dueDate || ""}
                      status={client.payment?.status || "deferred"}
                      progress={Math.round((client.paidAmount / client.totalAmount) * 100 || 0)}
                      onClick={() => handleClientClick(client)}
                    />
                  ))}
                  {groupedClients.deferred.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground text-sm py-3">
                      {t("No deferred payments")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Settled Column */}
              <Card className="bg-green-50/50 dark:bg-green-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-700 dark:text-green-400">{t("settled")}</CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300">
                      {groupedClients.settled.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="kanban-column">
                  {groupedClients.settled.map((client) => (
                    <InstallmentCard
                      key={client._id}
                      id={client._id}
                      clientId={client._id}
                      clientName={client.fullName}
                      amount={client.payment?.amount || 0}
                      dueDate={client.payment?.dueDate || ""}
                      status={client.payment?.status || "settled"}
                      progress={Math.round((client.paidAmount / client.totalAmount) * 100 || 0)}
                      onClick={() => handleClientClick(client)}
                    />
                  ))}
                  {groupedClients.settled.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground text-sm py-3">
                      {t("No settled payments")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Outstanding Column */}
              <Card className="bg-red-50/50 dark:bg-red-950/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-red-700 dark:text-red-400">{t("outstanding")}</CardTitle>
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300">
                      {groupedClients.outstanding.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="kanban-column">
                  {groupedClients.outstanding.map((client) => (
                    <InstallmentCard
                      key={client._id}
                      id={client._id}
                      clientId={client._id}
                      clientName={client.fullName}
                      amount={client.payment?.amount || 0}
                      dueDate={client.payment?.dueDate || ""}
                      status={client.payment?.status || "outstanding"}
                      progress={Math.round((client.paidAmount / client.totalAmount) * 100 || 0)}
                      onClick={() => handleClientClick(client)}
                    />
                  ))}
                  {groupedClients.outstanding.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground text-sm py-3">
                      {t("No outstanding payments")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Abandoned Column */}
              <Card className="bg-gray-50/50 dark:bg-gray-900/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-700 dark:text-gray-400">{t("abandoned")}</CardTitle>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300">
                      {groupedClients.abandoned.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="kanban-column">
                  {groupedClients.abandoned.map((client) => (
                    <InstallmentCard
                      key={client._id}
                      id={client._id}
                      clientId={client._id}
                      clientName={client.fullName}
                      amount={client.payment?.amount || 0}
                      dueDate={client.payment?.dueDate || ""}
                      status={client.payment?.status || "abandoned"}
                      progress={Math.round((client.paidAmount / client.totalAmount) * 100 || 0)}
                      onClick={() => handleClientClick(client)}
                    />
                  ))}
                  {groupedClients.abandoned.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground text-sm py-3">
                      {t("No abandoned payments")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedClient && (
        <ClientActionPopup
          isOpen={isClientPopupOpen}
          onClose={() => setIsClientPopupOpen(false)}
          client={{
            id: selectedClient.clientId,
            name: selectedClient.clientName,
            amount: selectedClient.amount,
            dueDate: selectedClient.dueDate ? format(new Date(selectedClient.dueDate), "PPP") : '',
          }}
        />
      )}
    </div>
  )
}
