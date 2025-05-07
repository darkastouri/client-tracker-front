"use client";

import { useState, useEffect } from "react";
import { addMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, BarChart2, Filter, Search, CreditCard, Clock, Ban, Package, RefreshCcw, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {  ActivityType, HistoryItem, HistoryService } from "@/services/historyService";
import { useTranslation } from "@/hooks/useTranslation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface HistoryListProps {
  clientId?: string;
  isClientHistory?: boolean;
}

export function HistoryList({ clientId, isClientHistory = false }: HistoryListProps) {
  const { t } = useTranslation();
  
  // Date range
  const now = new Date();
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(now));
  const [toDate, setToDate] = useState<Date>(endOfMonth(now));
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Data
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch history data
  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        from: format(fromDate, 'yyyy-MM-dd'),
        to: format(toDate, 'yyyy-MM-dd'),
        page: currentPage.toString(),
        limit: pageSize.toString(),
        populate: 'client,provider',
        activity: activityFilter !== "all" ? activityFilter : undefined
      };
      
      let response;
      if (clientId) {
        // Fetch specific client history
        const { client, ...clientParams } = params as any; // Remove client param if present
        response = await HistoryService.getClientHistory(clientId, clientParams);
      } else {
        // Fetch all history
        response = await HistoryService.getHistory(params);
      }
      
      if (response.success) {
        setHistoryItems(response.data.docs);
        setTotalPages(response.data.meta.totalPages);
      } else {
        setError(response.message);
        setHistoryItems([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to load history data");
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHistoryData();
  }, [fromDate, toDate, currentPage, pageSize, activityFilter, clientId]);
  
  // Filter history items based on search query
  const filteredItems = historyItems.filter(item => {
    if (!searchQuery) return true;
    
    const clientName = item.client?.fullName.toLowerCase() || "";
    const providerName = item.provider?.name.toLowerCase() || "";
    
    return clientName.includes(searchQuery.toLowerCase()) || 
           providerName.includes(searchQuery.toLowerCase());
  });
  
  // Get activity icon
  const getActivityIcon = (activity: ActivityType) => {
    switch (activity) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'deferral':
        return <Clock className="h-4 w-4" />;
      case 'abandonment':
        return <Ban className="h-4 w-4" />;
      case 'ignore':
        return <Ban className="h-4 w-4" />;
      case 'purchase':
        return <Package className="h-4 w-4" />;
      case 'refund':
        return <RefreshCcw className="h-4 w-4" />;
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };
  
  // Get activity badge color
  const getActivityColor = (activity: ActivityType) => {
    switch (activity) {
      case 'payment':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'deferral':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case 'abandonment':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case 'ignore':
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case 'purchase':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'refund':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };
  
  // Format date ranges for display
  const formattedDateRange = `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  
  // Preset date ranges
  const dateRanges = [
    {
      label: t("This Month"),
      from: startOfMonth(now),
      to: endOfMonth(now)
    },
    {
      label: t("Last Month"),
      from: startOfMonth(addMonths(now, -1)),
      to: endOfMonth(addMonths(now, -1))
    },
    {
      label: t("Last 3 Months"),
      from: startOfMonth(addMonths(now, -2)),
      to: endOfMonth(now)
    }
  ];
  
  const handleDateRangeSelect = (range: { from: Date, to: Date }) => {
    setFromDate(range.from);
    setToDate(range.to);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is applied in the filteredItems computation
  };
  
  return (
    <div className="space-y-6">
      {/* Filters and search bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start w-[260px]">
                <Calendar className="mr-2 h-4 w-4" />
                {formattedDateRange}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col sm:flex-row">
                <div className="border-r p-2">
                  <div className="py-2 px-4 font-medium text-sm">
                    {t("Quick Select")}
                  </div>
                  {dateRanges.map((range, index) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      className="w-full justify-start font-normal"
                      onClick={() => handleDateRangeSelect(range)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
                <div className="p-2 sm:p-4 flex flex-col gap-4">
                  <div>
                    <div className="mb-2 font-medium text-sm">{t("From")}</div>
                    <CalendarComponent
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => date && setFromDate(date)}
                      initialFocus
                    />
                  </div>
                  <div>
                    <div className="mb-2 font-medium text-sm">{t("To")}</div>
                    <CalendarComponent
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => date && setToDate(date)}
                      initialFocus
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select
            value={activityFilter}
            onValueChange={(value) => setActivityFilter(value as ActivityType | "all")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("Filter by activity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Activities")}</SelectItem>
              <SelectItem value="payment">{t("Payments")}</SelectItem>
              <SelectItem value="deferral">{t("Deferrals")}</SelectItem>
              <SelectItem value="abandonment">{t("Cancellations")}</SelectItem>
              <SelectItem value="ignore">{t("Ignored")}</SelectItem>
              <SelectItem value="purchase">{t("Purchases")}</SelectItem>
              <SelectItem value="refund">{t("Refunds")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder={isClientHistory ? t("Search activities...") : t("Search clients...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
            <span className="sr-only">{t("Search")}</span>
          </Button>
        </form>
      </div>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("Error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-[70%]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* History items list */}
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* User avatar (provider or client) */}
                      <Avatar>
                        <AvatarImage src="/placeholder-user.jpg" alt={isClientHistory ? item.provider?.name : item.client?.fullName} />
                        <AvatarFallback className="bg-primary/20">
                          {isClientHistory ? 
                            item.provider?.name?.charAt(0) || "U" : 
                            item.client?.fullName?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          {/* User name */}
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {isClientHistory ? item.provider?.name : item.client?.fullName}
                            </h3>
                            {!isClientHistory && (
                              <Badge variant="outline">
                                <User className="mr-1 h-3 w-3" />
                                {t("Client")}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Date */}
                          <span className="text-sm text-muted-foreground">
                            {item.details.date ? format(new Date(item.details.date), 'MMM dd, yyyy') : format(new Date(item.timestamp), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        {/* Activity description */}
                        <p className="mt-1 text-sm text-muted-foreground">
                          {getActivityDescription(item)}
                        </p>
                        
                        {/* Activity badge and amount if applicable */}
                        <div className="mt-2 flex items-center gap-2">
                          <Badge className={getActivityColor(item.activity)}>
                            {getActivityIcon(item.activity)}
                            <span className="ml-1 capitalize">{t(item.activity)}</span>
                          </Badge>
                          
                          {item.details.amount !== undefined && (
                            <span className="text-sm font-medium">
                              {item.details.amount.toFixed(2)} dt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      // Show only current page, first, last, and pages around current
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (page === 2 && currentPage > 3) || 
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return <PaginationItem key={page}>...</PaginationItem>;
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          ) : (
            <div className="bg-muted/20 border rounded-lg py-16 text-center">
              <h3 className="text-lg font-medium">{t("No history found")}</h3>
              <p className="text-muted-foreground mt-1">
                {t("Try adjusting your filters or date range")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper function to format activity description
function getActivityDescription(item: HistoryItem): string {
  switch (item.activity) {
    case 'payment':
      return `Made a payment of ${item.details.amount?.toFixed(2)} dt`;
    case 'deferral':
      return `Deferred a payment to ${item.details.date ? format(new Date(item.details.date), 'MMM dd, yyyy') : 'a later date'}`;
    case 'abandonment':
      return `Cancelled a payment`;
    case 'ignore':
      return `Ignored a payment`;
    case 'purchase':
      return `Made a purchase${item.details.amount ? ` of ${item.details.amount.toFixed(2)} dt` : ''}`;
    case 'refund':
      return `Processed a refund${item.details.amount ? ` of ${item.details.amount.toFixed(2)} dt` : ''}`;
    default:
      return `Performed activity: ${item.activity}`;
  }
} 