"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Search, Trash2, UserPlus, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious,
  PaginationLink
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

import { useTranslation } from "@/hooks/useTranslation"
import { ClientService } from "@/services/clientService"
import { Client, ClientParams } from "@/types/Client"
import { DEFAULT_PAGE_SIZE, CLIENT_STATUSES } from "@/config/constants"

// Helper function to get badge color based on tags
const getTagColor = (tag: string) => {
  switch(tag) {
    case 'vip':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case 'premium':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case 'regular':
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case 'occasional':
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch(status) {
    case 'settled':
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case 'scheduled':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case 'deferred':
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case 'outstanding':
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case 'abandoned':
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    case 'completed':
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

// Helper function to get score color
const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-500";
  if (score >= 75) return "text-blue-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
};

// Helper function to get score background
const getScoreBackground = (score: number) => {
  if (score >= 90) return "bg-emerald-100 dark:bg-emerald-900/20";
  if (score >= 75) return "bg-blue-100 dark:bg-blue-900/20";
  if (score >= 60) return "bg-amber-100 dark:bg-amber-900/20";
  return "bg-red-100 dark:bg-red-900/20";
};

export default function ClientsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [view, setView] = useState("grid");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const [newClient, setNewClient] = useState({
    fullName: "",
    description: "",
    phoneNum: "",
    installment: 0,
    paymentDay: 1,
    tags: [],
    locationInfo: {
      location: "",
      longitude: 0,
      latitude: 0
    }
  });
  
  const [clientStats, setClientStats] = useState({
    total: 0,
    settled: 0,
    scheduled: 0,
    outstanding: 0
  });

  // Fetch clients with pagination and filtering
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: ClientParams = {
        page: currentPage,
        limit: pageSize,
        populate: "orders,payments",
      };
      
      // Add name filter if search query exists
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Add status filter if selected
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await ClientService.getClients(params);
      
      if (response.success) {
        setClients(response.data.docs);
        setTotalPages(response.data.meta.totalPages);
        setTotalClients(response.data.meta.totalDocs);
        
        // Calculate client stats based on the current page data
        // This is a simplification - ideally we would fetch aggregated stats from an API endpoint
        const allSettled = response.data.docs.filter(c => c.status === CLIENT_STATUSES.SETTLED).length;
        const allScheduled = response.data.docs.filter(c => c.status === CLIENT_STATUSES.SCHEDULED).length;
        const allOutstanding = response.data.docs.filter(c => c.status === CLIENT_STATUSES.OUTSTANDING).length;
        
        setClientStats({
          total: response.data.meta.totalDocs,
          settled: allSettled,
          scheduled: allScheduled,
          outstanding: allOutstanding
        });
      } else {
        setError(response.message || "Failed to fetch clients");
        setClients([]);
      }
    } catch (err) {
      setError("An error occurred while fetching clients");
      console.error(err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load and when filters/pagination change
  useEffect(() => {
    fetchClients();
  }, [currentPage, pageSize, searchQuery, statusFilter]);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when search changes
    // The fetchClients will be triggered by the useEffect
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("locationInfo.")) {
      const locationField = name.split(".")[1];
      const fieldValue = locationField === 'longitude' || locationField === 'latitude' 
        ? parseFloat(value) || 0 // Convert to number or default to 0 if invalid
        : value;
        
      setNewClient((prev) => ({
        ...prev,
        locationInfo: {
          ...prev.locationInfo,
          [locationField]: fieldValue
        }
      }));
    } else if (name === 'phoneNum' || name === 'installment' || name === 'paymentDay') {
      // Handle other numeric fields
      const numValue = name === 'phoneNum' ? value : parseInt(value) || 0;
      setNewClient((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setNewClient((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAddClient = async () => {
    try {
      // Convert phoneNum to number
      const clientData = {
        ...newClient,
        phoneNum: parseInt(newClient.phoneNum as string, 10),
        installment: parseInt(newClient.installment as unknown as string, 10),
        paymentDay: parseInt(newClient.paymentDay as unknown as string, 10),
      };
      
      await ClientService.createClient(clientData);
      
      // Refresh the client list
      fetchClients();
      
      // Reset and close the dialog
      setIsAddClientOpen(false);
      setNewClient({
        fullName: "",
        description: "",
        phoneNum: "",
        installment: 0,
        paymentDay: 1,
        tags: [],
        locationInfo: {
          location: "",
          longitude: 0,
          latitude: 0
        }
      });
    } catch (err) {
      console.error("Failed to add client:", err);
      // Here you would typically show an error message to the user
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Clients")}</h2>
          <p className="text-muted-foreground">{t("Manage your client relationships")}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t("Add Client")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Add New Client")}</DialogTitle>
                <DialogDescription>
                  {t("Fill out the form below to add a new client.")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">{t("Full Name")}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={newClient.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNum">{t("Phone Number")}</Label>
                  <Input
                    id="phoneNum"
                    name="phoneNum"
                    value={newClient.phoneNum}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("Description")}</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newClient.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Location Info Fields */}
                <div className="space-y-4">
                  <Label>{t("Location Information")}</Label>
                  <div className="grid gap-2">
                    <Input
                      id="locationInfo.location"
                      name="locationInfo.location"
                      placeholder={t("Location name (e.g., New York)")}
                      value={newClient.locationInfo.location}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="locationInfo.longitude">{t("Longitude")}</Label>
                      <Input
                        id="locationInfo.longitude"
                        name="locationInfo.longitude"
                        type="number"
                        step="0.000001"
                        value={newClient.locationInfo.longitude}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="locationInfo.latitude">{t("Latitude")}</Label>
                      <Input
                        id="locationInfo.latitude"
                        name="locationInfo.latitude"
                        type="number"
                        step="0.000001"
                        value={newClient.locationInfo.latitude}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md text-center text-sm text-muted-foreground">
                    {t("A map picker component will be implemented here")}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="installment">{t("Installment Amount")}</Label>
                    <Input
                      id="installment"
                      name="installment"
                      type="number"
                      value={newClient.installment}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentDay">{t("Payment Day")}</Label>
                    <Input
                      id="paymentDay"
                      name="paymentDay"
                      type="number"
                      min="1"
                      max="31"
                      value={newClient.paymentDay}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button onClick={handleAddClient}>{t("Add Client")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Total Clients")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Settled")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.settled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Scheduled")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Outstanding")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.outstanding}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center">
          <Input
            type="search"
            placeholder={t("Search clients...")}
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="ml-2">
            <Search className="h-4 w-4" />
            <span className="sr-only">{t("Search")}</span>
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilterChange(null)}
          >
            {t("All")}
          </Button>
          <Button
            variant={statusFilter === CLIENT_STATUSES.SCHEDULED ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilterChange(CLIENT_STATUSES.SCHEDULED)}
          >
            {t("Scheduled")}
          </Button>
          <Button
            variant={statusFilter === CLIENT_STATUSES.SETTLED ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilterChange(CLIENT_STATUSES.SETTLED)}
          >
            {t("Settled")}
          </Button>
          <Button
            variant={statusFilter === CLIENT_STATUSES.OUTSTANDING ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusFilterChange(CLIENT_STATUSES.OUTSTANDING)}
          >
            {t("Outstanding")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
              >
                {t("More")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleStatusFilterChange(CLIENT_STATUSES.DEFERRED)}>
                {t("Deferred")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange(CLIENT_STATUSES.ABANDONED)}>
                {t("Abandoned")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilterChange(CLIENT_STATUSES.COMPLETED)}>
                {t("Completed")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={setView} className="w-[250px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">{t("Grid")}</TabsTrigger>
              <TabsTrigger value="table">{t("Table")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        // Loading skeleton
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        // Error message
        <Card className="p-6">
          <CardTitle className="text-red-500">{t("Error")}</CardTitle>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchClients} className="mt-4">
              {t("Try Again")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Client content
        <Tabs value={view} className="w-full">
          <TabsContent value="grid" className="mt-0">
            {clients.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{t("No clients found")}</p>
                <Button className="mt-4" onClick={() => setIsAddClientOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("Add Client")}
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <Link href={`/dashboard/clients/profile/${client._id}`} key={client._id}>
                    <Card className="h-full overflow-hidden hover:border-primary transition-colors cursor-pointer">
                      <CardHeader className="pb-0">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                              {client.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{client.fullName}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground">
                              {client.locationInfo?.location && (
                                <span className="flex items-center">
                                  {client.locationInfo.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="mt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <Badge className={getStatusColor(client.status)}>
                              {t(client.status)}
                            </Badge>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <div className={`text-lg font-semibold ${getScoreColor(client.score)}`}>
                                {client.score}
                              </div>
                              <span className="text-xs text-muted-foreground ml-1">/{100}</span>
                            </div>
                            <div className="text-xs text-muted-foreground text-right">{t("Score")}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("Phone")}</span>
                            <span>{client.phoneNum}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("Total Orders")}</span>
                            <span>{client.orders?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("Payments")}</span>
                            <span>{client.payments?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("Total Amount")}</span>
                            <span className="font-medium">{client.totalAmount?.toFixed(2) || "0.00"} dt</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("Paid Amount")}</span>
                            <span className="font-medium">{client.paidAmount?.toFixed(2) || "0.00"} dt</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-1">
                          {client.tags?.map((tag) => (
                            <Badge variant="secondary" key={tag} className={getTagColor(tag)}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="table" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Client")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("Location")}</TableHead>
                    <TableHead className="text-center">{t("Score")}</TableHead>
                    <TableHead className="text-right">{t("Total")}</TableHead>
                    <TableHead className="text-right">{t("Paid")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">{t("No clients found")}</p>
                        <Button className="mt-4" onClick={() => setIsAddClientOpen(true)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          {t("Add Client")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {client.fullName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.fullName}</div>
                              <div className="text-sm text-muted-foreground">{client.phoneNum}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(client.status)}>
                            {t(client.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.locationInfo?.location || "-"}</TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${getScoreBackground(client.score)}`}>
                            <span className={`text-sm font-medium ${getScoreColor(client.score)}`}>
                              {client.score}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {client.totalAmount?.toFixed(2) || "0.00"} dt
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {client.paidAmount?.toFixed(2) || "0.00"} dt
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/clients/profile/${client._id}`}>
                                  {t("View Profile")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/clients/edit/${client._id}`}>
                                  {t("Edit Client")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                {t("Add Payment")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("Delete Client")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Pagination */}
      {!loading && clients.length > 0 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pageToShow === currentPage}
                      onClick={() => handlePageChange(pageToShow)}
                    >
                      {pageToShow}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground mt-2">
        {!loading && clients.length > 0 && (
          <p>
            {t("Showing")} {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalClients)} {t("of")} {totalClients} {t("clients")}
          </p>
        )}
      </div>
    </div>
  );
}
