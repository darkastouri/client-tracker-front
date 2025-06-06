"use client"

import { useState, useEffect } from "react"
import { format, subMonths } from "date-fns"
import { Calendar, Filter, ClipboardList, Search, Loader2, X, CreditCard, Clock, Ban, ShoppingCart, RefreshCcw, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

import { useTranslation } from "@/hooks/useTranslation"
import { ActivityType, HistoryService, HistoryItem } from "@/services/historyService"
import { ClientService } from "@/services/clientService"

export default function HistoryPage() {
  const { t } = useTranslation()
  
  // States for date range
  const [fromDate, setFromDate] = useState<string>(HistoryService.formatDateParam(subMonths(new Date(), 1)))
  const [toDate, setToDate] = useState<string>(HistoryService.formatDateParam(new Date()))
  
  // States for filtering
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all")
  const [clientFilter, setClientFilter] = useState<string>("all")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  
  // Data states
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch all clients for the dropdown filter
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await ClientService.getClients({ limit: 100 })
        if (response.success) {
          setClients(response.data.docs)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }
    
    fetchClients()
  }, [])
  
  // Fetch history data
  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params: {
        from: string;
        to: string;
        page: string;
        limit: string;
        populate: string;
        activity?: ActivityType;
      } = {
        from: fromDate,
        to: toDate,
        page: currentPage.toString(),
        limit: pageSize.toString(),
        populate: "client,details.items,details.refundedItem,provider"
      }
      
      if (activityFilter !== "all") {
        params.activity = activityFilter as ActivityType
      }
      
      let response;
      
      if (clientFilter !== "all") {
        // Use the client ID in the URL path rather than as a query parameter
        response = await HistoryService.getClientHistory(clientFilter, params);
      } else {
        // Use the global history endpoint
        response = await HistoryService.getHistory(params);
      }
      
      if (response.success) {
        setHistoryItems(response.data.docs)
        setTotalPages(response.data.meta.totalPages)
      } else {
        setError(response.message)
        setHistoryItems([])
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      setError("Failed to load history data. Please try again later.")
      setHistoryItems([])
    } finally {
      setLoading(false)
    }
  }
  
  // Initial fetch and on filter changes
  useEffect(() => {
    fetchHistory()
  }, [fromDate, toDate, activityFilter, clientFilter, currentPage, pageSize])
  
  // Helper to get activity icon
  const getActivityIcon = (activity: ActivityType) => {
    switch (activity) {
      case ActivityType.PAYMENT:
        return <CreditCard className="h-4 w-4" />
      case ActivityType.DEFERRAL:
        return <Clock className="h-4 w-4" />
      case ActivityType.ABANDONMENT:
        return <Ban className="h-4 w-4" />
      case ActivityType.IGNORE:
        return <X className="h-4 w-4" />
      case ActivityType.PURCHASE:
        return <ShoppingCart className="h-4 w-4" />
      case ActivityType.REFUND:
        return <RefreshCcw className="h-4 w-4" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }
  
  // Helper to get activity color
  const getActivityColor = (activity: ActivityType) => {
    switch (activity) {
      case ActivityType.PAYMENT:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case ActivityType.DEFERRAL:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case ActivityType.ABANDONMENT:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case ActivityType.IGNORE:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case ActivityType.PURCHASE:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case ActivityType.REFUND:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }
  
  // Reset filters
  const resetFilters = () => {
    setFromDate(HistoryService.formatDateParam(subMonths(new Date(), 1)))
    setToDate(HistoryService.formatDateParam(new Date()))
    setActivityFilter("all")
    setClientFilter("all")
    setCurrentPage(1)
  }
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }
  
  // Render activity details based on type
  const renderActivityDetails = (item: HistoryItem) => {
    switch (item.activity) {
      case ActivityType.PAYMENT:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("Amount")}</span>
              <span className="font-medium">{item.details.amount?.toFixed(2)} dt</span>
            </div>
            {item.details.date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Date")}</span>
                <span>{formatDate(item.details.date)}</span>
              </div>
            )}
            {item.client && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Client")}</span>
                <Link href={`/dashboard/clients/profile/${item.client._id}`} className="text-primary hover:underline">
                  {item.client.fullName}
                </Link>
              </div>
            )}
          </div>
        )
        
      case ActivityType.DEFERRAL:
        return (
          <div className="space-y-2">
            {item.details.date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Deferred to")}</span>
                <span>{formatDate(item.details.date)}</span>
              </div>
            )}
            {item.client && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Client")}</span>
                <Link href={`/dashboard/clients/profile/${item.client._id}`} className="text-primary hover:underline">
                  {item.client.fullName}
                </Link>
              </div>
            )}
          </div>
        )
        
      case ActivityType.PURCHASE:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("Purchase Amount")}</span>
              <span className="font-medium">{item.details.amount?.toFixed(2)} dt</span>
            </div>
            {item.details.date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Date")}</span>
                <span>{formatDate(item.details.date)}</span>
              </div>
            )}
            {item.client && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Client")}</span>
                <Link href={`/dashboard/clients/profile/${item.client._id}`} className="text-primary hover:underline">
                  {item.client.fullName}
                </Link>
              </div>
            )}
            {item.details.items && item.details.items.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground block mb-1">{t("Items")}</span>
                <div className="space-y-1 mt-2 text-sm">
                  {item.details.items.map((orderItem, index) => (
                    <div key={index} className="flex justify-between border-b pb-1">
                      <span>{orderItem.item}</span>
                      <span>
                        {orderItem.quantity} × {orderItem.price?.toFixed(2)} dt
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
        
      case ActivityType.REFUND:
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("Refund Amount")}</span>
              <span className="font-medium">{item.details.amount?.toFixed(2)} dt</span>
            </div>
            {item.details.date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Date")}</span>
                <span>{formatDate(item.details.date)}</span>
              </div>
            )}
            {item.client && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Client")}</span>
                <Link href={`/dashboard/clients/profile/${item.client._id}`} className="text-primary hover:underline">
                  {item.client.fullName}
                </Link>
              </div>
            )}
            {item.details.refundedItem && (
              <div className="mt-2">
                <div className="text-sm text-muted-foreground mb-1">{t("Refunded Item")}</div>
                <div className="border rounded-md p-2">
                  <div className="flex justify-between border-b pb-1 mb-1">
                    <span className="font-medium">{item.details.refundedItem.item}</span>
                    <span>{item.details.refundedItem.quantity} × {item.details.refundedItem.price?.toFixed(2)} dt</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("Subtotal")}</span>
                    <span className="font-medium">{(item.details.refundedItem.quantity * item.details.refundedItem.price).toFixed(2)} dt</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
        
      default:
        return (
          <div className="space-y-2">
            {item.details.date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Date")}</span>
                <span>{formatDate(item.details.date)}</span>
              </div>
            )}
            {item.client && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Client")}</span>
                <Link href={`/dashboard/clients/profile/${item.client._id}`} className="text-primary hover:underline">
                  {item.client.fullName}
                </Link>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Activity History")}</h1>
          <p className="text-muted-foreground">{t("Track all activities across the system")}</p>
        </div>
      </div>

        <Card>
        <CardHeader>
          <CardTitle>{t("Activity History")}</CardTitle>
          <CardDescription>{t("View and filter all system activities")}</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("From Date")}</label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("To Date")}</label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Activity Type")}</label>
                  <Select value={activityFilter} onValueChange={(value) => setActivityFilter(value as ActivityType | "all")}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("All Activities")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("All Activities")}</SelectItem>
                      <SelectItem value={ActivityType.PAYMENT}>{t("Payments")}</SelectItem>
                      <SelectItem value={ActivityType.DEFERRAL}>{t("Deferrals")}</SelectItem>
                      <SelectItem value={ActivityType.ABANDONMENT}>{t("Cancellations")}</SelectItem>
                      <SelectItem value={ActivityType.PURCHASE}>{t("Purchases")}</SelectItem>
                      <SelectItem value={ActivityType.REFUND}>{t("Refunds")}</SelectItem>
                      <SelectItem value={ActivityType.IGNORE}>{t("Ignored")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Client")}</label>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("All Clients")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("All Clients")}</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
      </div>

              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={resetFilters}
              >
                <X className="h-4 w-4" />
                {t("Reset Filters")}
            </Button>
          </div>
            
            <Separator />
            
            {/* History list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">{t("Loading history...")}</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("Error")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : historyItems.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">{t("No history found")}</h3>
                <p className="text-muted-foreground">
                  {t("Try changing your filters or date range")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item) => (
                  <Card key={item._id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Activity type column */}
                        <div className={`p-4 sm:w-1/3 md:w-1/4 ${getActivityColor(item.activity as ActivityType)}`}>
                          <div className="flex items-center gap-2">
                            {getActivityIcon(item.activity as ActivityType)}
                            <span className="font-medium capitalize">
                              {t(item.activity)}
                            </span>
          </div>
                          <p className="text-sm mt-2">
                            {item.timestamp && format(new Date(item.timestamp), "PPP p")}
                          </p>
                          {item.provider && (
                            <p className="text-sm mt-1">
                              {t("By")}: {item.provider.name}
                            </p>
                          )}
        </div>

                        {/* Activity details column */}
                        <div className="p-4 sm:flex-1">
                          {renderActivityDetails(item)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Pagination */}
                {totalPages >= 1 && (
                  <div className="flex flex-col items-center gap-2 mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(currentPage - 1)
                            }}
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          // Logic to show pages around current page
                          let pageNum = currentPage - 2 + i
                          if (currentPage < 3) {
                            pageNum = i + 1
                          } else if (currentPage > totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          }
                          
                          // Make sure pageNum is within valid range
                          if (pageNum < 1 || pageNum > totalPages) {
                            return null
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <Button 
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="icon" 
                                onClick={() => handlePageChange(pageNum)}
                                className="h-9 w-9"
                              >
                                {pageNum}
                              </Button>
                            </PaginationItem>
                          )
                        })}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(currentPage + 1)
                            }}
                            aria-disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{t("Page")} {currentPage} {t("of")} {totalPages} ({historyItems.length} {t("items")})</span>
                      <span className="mx-2">|</span>
                      <span>{t("Show")}:</span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                          setPageSize(parseInt(value));
                          setCurrentPage(1); // Reset to first page on page size change
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
