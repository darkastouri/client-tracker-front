"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, MapPin, Phone, Calendar, Clock, ShoppingBag, BarChart3, ShoppingCart, Loader2, CreditCard, Ban, RefreshCcw, Plus, ChevronDown, ChevronUp, Pencil, Trash, History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/useTranslation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientService } from "@/services/clientService"
import { Client, ClientPayment, ClientOrder } from "@/types/Client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { authHeader } from "@/utils/auth"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ClientHistoryTab } from "@/components/ClientHistoryTab"

// Helper functions for client scoring visualization
const getScoreColor = (score: number, maxScore: number = 120) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "text-emerald-500";
  if (percentage >= 75) return "text-blue-500";
  if (percentage >= 60) return "text-amber-500";
  if (percentage >= 45) return "text-orange-500";
  return "text-red-500";
};

const getScoreBackground = (score: number, maxScore: number = 120) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "bg-emerald-100 dark:bg-emerald-900/20";
  if (percentage >= 75) return "bg-blue-100 dark:bg-blue-900/20";
  if (percentage >= 60) return "bg-amber-100 dark:bg-amber-900/20";
  if (percentage >= 45) return "bg-orange-100 dark:bg-orange-900/20";
  return "bg-red-100 dark:bg-red-900/20";
};

const getScoreBorderColor = (score: number, maxScore: number = 120) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "border-emerald-500";
  if (percentage >= 75) return "border-blue-500";
  if (percentage >= 60) return "border-amber-500";
  if (percentage >= 45) return "border-orange-500";
  return "border-red-500";
};

const getStatusColor = (status: string) => {
  switch(status) {
    case "settled": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "deferred": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "outstanding": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "abandoned": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    case "completed": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  
  const [activeTab, setActiveTab] = useState("progress")
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [skipDialog, setSkipDialog] = useState(false)
  const [refundDialog, setRefundDialog] = useState(false)
  const [deferDialog, setDeferDialog] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentComment, setPaymentComment] = useState("")
  const [skipReason, setSkipReason] = useState("")
  const [skipComment, setSkipComment] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null)
  const [deferDays, setDeferDays] = useState("7")
  const [deferDate, setDeferDate] = useState("")
  const [deferReason, setDeferReason] = useState("")
  const [refundQuantity, setRefundQuantity] = useState(1)
  const [selectedItem, setSelectedItem] = useState("")
  const [loadingAction, setLoadingAction] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  
  // Define product type for order items
  type Product = {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
  
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [abandonDialog, setAbandonDialog] = useState(false)
  const [abandonReason, setAbandonReason] = useState("")
  
  // New state for old payment dialog
  const [oldPaymentDialog, setOldPaymentDialog] = useState(false)
  const [oldPayments, setOldPayments] = useState<Array<{
    amount: number;
    dueDate: string;
    comment: string;
    status: string;
  }>>([])
  const [newOldPayment, setNewOldPayment] = useState<{
    amount: string;
    dueDate: string;
    comment: string;
    status: string;
  }>({
    amount: "",
    dueDate: format(new Date(), "yyyy-MM-dd"), 
    comment: "",
    status: "settled"
  })

  // New state for adding additional orders
  const [addOrderDialog, setAddOrderDialog] = useState(false)
  const [orderItems, setOrderItems] = useState<Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>>([])
  const [newOrderItem, setNewOrderItem] = useState<{
    productName: string;
    quantity: string;
    unitPrice: string;
  }>({
    productName: "",
    quantity: "1",
    unitPrice: ""
  })
  const [orderComment, setOrderComment] = useState("")
  const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [orderDiscount, setOrderDiscount] = useState("0")
  
  // State for managing multiple orders
  const [orders, setOrders] = useState<Array<{
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
    comment: string;
    date: string;
    discount: number;
    totalAmount: number;
  }>>([])

  // Add new state for delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await ClientService.getClientById(clientId);
        
        if (response.success && response.data) {
          setClient(response.data);
          if (response.data.installment) {
            setPaymentAmount(response.data.installment.toString());
          }
        } else {
          setError(response.message || "Failed to fetch client data");
        }
      } catch (err) {
        setError("An error occurred while fetching client data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  // Calculate progress percentage
  const progressPercentage = client ? (client.paidAmount / client.totalAmount) * 100 : 0;
  
  // Calculate score percentage for the visual elements
  const scorePercentage = client ? client.score  : 85;

  const handlePayment = async () => {
    if (!paymentAmount) {
      toast({
        title: t("Error"),
        description: t("Please enter a payment amount"),
        variant: "destructive"
      });
      return;
    }

    setLoadingAction(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${clientId}/pay`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          comment: paymentComment || ""
        }),
      });
      
      if (response.ok) {
    toast({
      title: t("Payment successful"),
      description: t("The payment has been processed successfully."),
        });
        
        // Refresh client data
        const updatedClient = await ClientService.getClientById(clientId);
        if (updatedClient.success) {
          setClient(updatedClient.data);
        }
      } else {
        const errorData = await response.json();
        
        // Check if there are specific validation errors
        if (errorData.errors) {
          // Display each validation error
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');

    toast({
            title: t("Validation errors"),
            description: (
              <pre className="mt-2 w-full rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive overflow-auto">
                {errorMessages}
              </pre>
            ),
            variant: "destructive",
            duration: 5000, // Show for 5 seconds
          });
        } else {
          toast({
            title: t("Payment failed"),
            description: errorData.message || t("An error occurred while processing the payment."),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: t("Payment failed"),
        description: t("An error occurred while processing the payment."),
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
      setPaymentDialog(false);
      setPaymentComment("");
    }
  }

  const handleSkip = async () => {
    setLoadingAction(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${clientId}/cancel`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: skipComment || ""
        }),
      });
      
      if (response.ok) {
        toast({
          title: t("Installment cancelled"),
          description: t("The installment has been cancelled successfully."),
        });
        
        // Refresh client data
        const updatedClient = await ClientService.getClientById(clientId);
        if (updatedClient.success) {
          setClient(updatedClient.data);
        }
      } else {
        const errorData = await response.json();
        
        // Check if there are specific validation errors
        if (errorData.errors) {
          // Display each validation error
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          toast({
            title: t("Validation errors"),
            description: (
              <pre className="mt-2 w-full rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive overflow-auto">
                {errorMessages}
              </pre>
            ),
            variant: "destructive",
            duration: 5000, // Show for 5 seconds
          });
        } else {
          toast({
            title: t("Cancellation failed"),
            description: errorData.message || t("An error occurred while cancelling the installment."),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: t("Cancellation failed"),
        description: t("An error occurred while cancelling the installment."),
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
      setSkipDialog(false);
      setSkipComment("");
    }
  }

  const handleRefund = async () => {
    if (!selectedItem) {
      toast({
        title: t("Error"),
        description: t("Please select an item to refund"),
        variant: "destructive"
      });
      return;
    }

    if (refundQuantity <= 0) {
      toast({
        title: t("Error"),
        description: t("Please enter a valid quantity"),
        variant: "destructive"
      });
      return;
    }

    setLoadingAction(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/orders/${clientId}/refund/${selectedItem}`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: refundQuantity
        }),
      });
      
      if (response.ok) {
    toast({
      title: t("Refund processed"),
      description: t("The refund has been processed successfully."),
        });
        
        // Refresh client data
        const updatedClient = await ClientService.getClientById(clientId);
        if (updatedClient.success) {
          setClient(updatedClient.data);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: t("Refund failed"),
          description: errorData.message || t("An error occurred while processing the refund."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Refund error:", error);
      toast({
        title: t("Refund failed"),
        description: t("An error occurred while processing the refund."),
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
      setRefundDialog(false);
      setSelectedItem("");
      setRefundQuantity(1);
    }
  }

  const handleAbandon = () => {
    toast({
      title: t("Installment abandoned"),
      description: t("The installment has been abandoned."),
    })
    setAbandonDialog(false)
  }

  const handleDefer = async () => {
    if (!deferDate) {
      toast({
        title: t("Error"),
        description: t("Please select a defer date"),
        variant: "destructive"
      });
      return;
    }

    setLoadingAction(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${clientId}/skip`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: deferDate,
          comment: deferReason || ""
        }),
      });
      
      if (response.ok) {
        toast({
          title: t("Installment deferred"),
          description: t("The installment has been deferred successfully."),
        });
        
        // Refresh client data
        const updatedClient = await ClientService.getClientById(clientId);
        if (updatedClient.success) {
          setClient(updatedClient.data);
        }
      } else {
        const errorData = await response.json();
        
        // Check if there are specific validation errors
        if (errorData.errors) {
          // Display each validation error
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          toast({
            title: t("Validation errors"),
            description: (
              <pre className="mt-2 w-full rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive overflow-auto">
                {errorMessages}
              </pre>
            ),
            variant: "destructive",
            duration: 5000, // Show for 5 seconds
          });
        } else {
          toast({
            title: t("Deferral failed"),
            description: errorData.message || t("An error occurred while deferring the installment."),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Deferral error:", error);
      toast({
        title: t("Deferral failed"),
        description: t("An error occurred while deferring the installment."),
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
      setDeferDialog(false);
      setDeferDate("");
      setDeferReason("");
    }
  }

  const toggleProductSelection = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  // Handler for adding an old payment to the list
  const addOldPaymentToList = () => {
    if (!newOldPayment.amount || !newOldPayment.dueDate) {
      toast({
        title: t("Error"),
        description: t("Please fill all required fields"),
        variant: "destructive"
      });
      return;
    }

    setOldPayments([
      ...oldPayments,
      {
        amount: parseFloat(newOldPayment.amount),
        dueDate: newOldPayment.dueDate,
        comment: newOldPayment.comment,
        status: newOldPayment.status
      }
    ]);

    // Reset form for next entry
    setNewOldPayment({
      amount: "",
      dueDate: newOldPayment.dueDate,
      comment: "",
      status: "settled"
    });
  };

  // Handler for removing an old payment from the list
  const removeOldPayment = (index: number) => {
    const updatedPayments = [...oldPayments];
    updatedPayments.splice(index, 1);
    setOldPayments(updatedPayments);
  };

  // Handler for submitting old payments
  const submitOldPayments = async () => {
    if (oldPayments.length === 0) {
      toast({
        title: t("Error"),
        description: t("Please add at least one payment"),
        variant: "destructive"
      });
      return;
    }

    setLoadingAction(true);
    
    try {
      // Format payments according to the expected schema
      const formattedPayments = {
        payments: oldPayments.map(payment => ({
          amount: payment.amount,
          dueDate: payment.dueDate,
          comment: payment.comment || "",
          status: payment.status
        }))
      };

      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${clientId}/old`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedPayments),
      });
      
      if (response.ok) {
        toast({
          title: t("Payments added"),
          description: t("Old payments have been added successfully."),
        });
        
        // Refresh client data
        const updatedClient = await ClientService.getClientById(clientId);
        if (updatedClient.success) {
          setClient(updatedClient.data);
        }
        
        // Reset state and close dialog
        setOldPayments([]);
        setOldPaymentDialog(false);
      } else {
        const errorData = await response.json();
        
        // Check if there are specific validation errors
        if (errorData.errors) {
          // Display each validation error
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          toast({
            title: t("Validation errors"),
            description: (
              <pre className="mt-2 w-full rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive overflow-auto">
                {errorMessages}
              </pre>
            ),
            variant: "destructive",
            duration: 5000, // Show for 5 seconds
          });
        } else {
          toast({
            title: t("Failed to add payments"),
            description: errorData.message || t("An error occurred while adding old payments."),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error adding old payments:", error);
      toast({
        title: t("Failed to add payments"),
        description: t("An error occurred while adding old payments."),
        variant: "destructive"
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Handler for adding an order item to the list
  const addOrderItemToList = () => {
    if (!newOrderItem.productName || !newOrderItem.quantity || !newOrderItem.unitPrice) {
      toast({
        title: t("Error"),
        description: t("Please fill all required fields"),
        variant: "destructive"
      });
      return;
    }

    setOrderItems([
      ...orderItems,
      {
        productName: newOrderItem.productName,
        quantity: parseInt(newOrderItem.quantity),
        unitPrice: parseFloat(newOrderItem.unitPrice)
      }
    ]);

    // Reset form for next entry but keep the same product name for fast entry
    setNewOrderItem({
      productName: "",  // Clear product name for the next item
      quantity: "1",
      unitPrice: ""
    });
  };

  // Handler for removing an order item from the list
  const removeOrderItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  // Handler for adding the current order to the orders list
  const addOrderToList = () => {
    if (orderItems.length === 0) {
      toast({
        title: t("Error"),
        description: t("Please add at least one item to the order"),
        variant: "destructive"
      });
      return;
    }

    // Calculate total amount for this order
    const totalAmount = orderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    const discountValue = parseFloat(orderDiscount) || 0;
    const finalTotal = Math.max(0, totalAmount - discountValue);

    // Add current order to orders list
    setOrders([
      ...orders,
      {
        items: [...orderItems],
        comment: orderComment,
        date: orderDate,
        discount: discountValue,
        totalAmount: finalTotal
      }
    ]);

    // Reset current order form but keep the date
    setOrderItems([]);
    setOrderComment("");
    // Keep the orderDate the same
    setOrderDiscount("0");

    toast({
      title: t("Order added"),
      description: t("Order has been added to the list"),
    });
  };

  // Handler for removing an order from the orders list
  const removeOrder = (index: number) => {
    const updatedOrders = [...orders];
    updatedOrders.splice(index, 1);
    setOrders(updatedOrders);
  };

  // Handler for submitting orders
  const submitOrders = async () => {
    if (orders.length === 0) {
      // If no orders in the list but we have current order items, add it first
      if (orderItems.length > 0) {
        addOrderToList();
        return; // Will call submitOrders again after the state updates
      } else {
        toast({
          title: t("Error"),
          description: t("Please add at least one order"),
          variant: "destructive"
        });
        return;
      }
    }

    setLoadingAction(true);
    
    try {
      // Format orders to match the API schema
      const formattedOrders = orders.map(order => {
        return {
          items: order.items.map(item => ({
            item: item.productName,
            price: item.unitPrice,
            quantity: item.quantity
          })),
          date: order.date,
          discount: order.discount
        };
      });

      const response = await fetch(`https://client-tracker-back.onrender.com/api/orders/${clientId}`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: formattedOrders }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if there are specific validation errors
        if (errorData.errors) {
          // Display each validation error
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          toast({
            title: t("Validation errors"),
            description: (
              <pre className="mt-2 w-full rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive overflow-auto">
                {errorMessages}
              </pre>
            ),
            variant: "destructive",
            duration: 5000
          });
        } else {
          toast({
            title: t("Failed to create orders"),
            description: errorData.message || t("An error occurred while creating the orders."),
            variant: "destructive"
          });
        }
        
        throw new Error("Failed to create orders");
      }
      
      toast({
        title: t("Orders created"),
        description: t("All orders have been created successfully."),
      });
      
      // Refresh client data
      const updatedClient = await ClientService.getClientById(clientId);
      if (updatedClient.success) {
        setClient(updatedClient.data);
      }
      
      // Reset state and close dialog
      setOrders([]);
      setOrderItems([]);
      setOrderComment("");
      // Don't reset the date - keep it for next order
      setAddOrderDialog(false);
    } catch (error) {
      console.error("Error creating orders:", error);
      // Error toast is already shown above
    } finally {
      setLoadingAction(false);
    }
  };

  // Handler for deleting a client
  const handleDeleteClient = async () => {
    if (deleteConfirmation !== client?.fullName) {
      toast({
        title: t("Error"),
        description: t("Please type the client's full name to confirm deletion"),
        variant: "destructive"
      });
      return;
    }

    setDeleteLoading(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: client.fullName
        }),
      });
      
      if (response.ok) {
        toast({
          title: t("Client deleted"),
          description: t("The client has been deleted successfully."),
        });
        
        // Redirect to clients page
        router.push("/dashboard/clients");
      } else {
        const errorData = await response.json();
        
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          toast({
            title: t("Validation errors"),
            description: (
              <pre className="mt-2 w-full rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive overflow-auto">
                {errorMessages}
              </pre>
            ),
            variant: "destructive",
            duration: 5000
          });
        } else {
          toast({
            title: t("Deletion failed"),
            description: errorData.message || t("An error occurred while deleting the client."),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: t("Deletion failed"),
        description: t("An error occurred while deleting the client."),
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialog(false);
      setDeleteConfirmation("");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t("Loading client data...")}</p>
      </div>
    );
  }

  if (error || !client) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">{t("Client Profile")}</h2>
      </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("Error")}</AlertTitle>
          <AlertDescription>
            {error || t("Client not found")}
            <div className="mt-4">
              <Button onClick={() => router.back()}>{t("Go Back")}</Button>
              </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{t("Client Profile")}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
            size="sm" 
            className="flex items-center gap-1 text-amber-600"
            onClick={() => router.push(`/dashboard/clients/edit/${client._id}`)}
                    >
            <Pencil className="h-4 w-4" />
            {t("Edit")}
                    </Button>
                    <Button
                      variant="outline"
            size="sm" 
            className="flex items-center gap-1 text-red-600"
            onClick={() => setDeleteDialog(true)}
                    >
            <Trash className="h-4 w-4" />
            {t("Delete")}
                    </Button>
                  </div>
                </div>

      {/* Enhanced Client Header Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8 px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src="/placeholder-user.jpg" alt={client.fullName} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">{client.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold">{client.fullName}</h3>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {client.phoneNum}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {client.locationInfo?.location || t("Location not specified")}
                </span>
                  </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <Badge className={getStatusColor(client.status)}>
                  {t(client.status.charAt(0).toUpperCase() + client.status.slice(1))}
                </Badge>
                {client.tags && client.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
                </div>

              {/* Payment Progress Bar */}
              <div className="mt-4 space-y-1.5 max-w-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("Payment Progress")}</span>
                  <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
              </div>
                <div className="h-2.5 w-full rounded-full bg-muted/50">
                  <div 
                    className={`h-full rounded-full ${
                      progressPercentage >= 100
                        ? "bg-green-500"
                        : progressPercentage >= 75
                        ? "bg-blue-500"
                        : progressPercentage >= 50
                        ? "bg-amber-500"
                        : progressPercentage >= 25
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${progressPercentage}%` }} 
                  />
        </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{client.paidAmount.toFixed(2)} dt {t("paid")}</span>
                  <span>{client.totalAmount.toFixed(2)} dt {t("total")}</span>
                </div>
                </div>
                </div>

            {/* Score visualization */}
            <div className="min-w-[150px] flex flex-col items-center gap-2">
              <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 ${getScoreBorderColor(client.score, 120)}`}>
                <div className={`absolute inset-1 rounded-full ${getScoreBackground(client.score, 120)} opacity-30`}></div>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getScoreColor(client.score, 120)}`}>
                    {client.score}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    / 120
                  </span>
                </div>
                </div>
              <span className="text-sm font-medium">{t("Client Score")}</span>
            </div>
          </div>
          </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t">
          <div className="p-4 text-center border-r">
            <p className="text-sm text-muted-foreground">{t("Total Orders")}</p>
            <p className="text-2xl font-bold">{client.orders?.length || 0}</p>
                      </div>
          <div className="p-4 text-center border-r">
            <p className="text-sm text-muted-foreground">{t("Total Amount")}</p>
            <p className="text-2xl font-bold">{client.totalAmount?.toFixed(2) || '0'} dt</p>
                    </div>
          <div className="p-4 text-center border-r">
            <p className="text-sm text-muted-foreground">{t("Installment")}</p>
            <p className="text-2xl font-bold">{client.installment?.toFixed(2) || '0'} dt</p>
                  </div>
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{t("Payment Day")}</p>
            <p className="text-2xl font-bold">{client.paymentDay || '-'}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-muted/20 border-t p-4 flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setPaymentDialog(true)} className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800">
            <CreditCard className="mr-2 h-4 w-4" />
            {t("Pay Installment")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeferDialog(true)} className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800">
            <Clock className="mr-2 h-4 w-4" />
            {t("Defer Installment")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSkipDialog(true)} className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800">
            <Ban className="mr-2 h-4 w-4" />
            {t("Cancel Installment")}
          </Button>
        </div>
              </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-md mb-4">
          <TabsTrigger value="info">{t("Client Info")}</TabsTrigger>
          <TabsTrigger value="orders">{t("Orders")}</TabsTrigger>
          <TabsTrigger value="payments">{t("Payments")}</TabsTrigger>
          <TabsTrigger value="history">{t("History")}</TabsTrigger>
        </TabsList>

        {/* Client Info Tab */}
        <TabsContent value="info" className="space-y-4">
              <Card>
            <CardHeader>
              <CardTitle>{t("Client Details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("Phone Number")}</h3>
                  <p>{client.phoneNum}</p>
                          </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("Location")}</h3>
                  <p>{client.locationInfo?.location || t("Not specified")}</p>
                        </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("Payment Day")}</h3>
                  <p>{client.paymentDay}</p>
                      </div>
                        <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("Installment Amount")}</h3>
                  <p>{client.installment?.toFixed(2)} dt</p>
                        </div>
                        </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("Description")}</h3>
                <p>{client.description || t("No description provided")}</p>
                      </div>

                            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("Tags")}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {client.tags && client.tags.length > 0 ? (
                    client.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("No tags")}</p>
                  )}
                            </div>
                            </div>

              {/* Payment Statistics */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-xs text-muted-foreground uppercase">{t("Total")}</div>
                    <div className="text-2xl font-bold mt-1">{client.totalAmount?.toFixed(2) || "0.00"} dt</div>
              </CardContent>
            </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-xs text-muted-foreground uppercase">{t("Paid")}</div>
                    <div className="text-2xl font-bold mt-1 text-emerald-500">{client.paidAmount?.toFixed(2) || "0.00"} dt</div>
              </CardContent>
            </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-xs text-muted-foreground uppercase">{t("Remaining")}</div>
                    <div className="text-2xl font-bold mt-1 text-amber-500">
                      {Math.max(0, (client.totalAmount - client.paidAmount) || 0).toFixed(2)} dt
                          </div>
              </CardContent>
            </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-xs text-muted-foreground uppercase">{t("Next Payment")}</div>
                    <div className="text-2xl font-bold mt-1">{client.installment?.toFixed(2) || "0.00"} dt</div>
              </CardContent>
            </Card>
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>

        {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("Order History")}</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setAddOrderDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t("Add Orders")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setRefundDialog(true)}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {t("Refund Product")}
                </Button>
                  </div>
            </CardHeader>
            <CardContent>
              {client?.orders && client.orders.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{t("Order Date")}</TableHead>
                        <TableHead>{t("Items")}</TableHead>
                        <TableHead>{t("Total")}</TableHead>
                        <TableHead>{t("Actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.orders
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((order, i) => (
                          <React.Fragment key={order._id}>
                            <TableRow>
                              <TableCell className="font-medium">{i + 1}</TableCell>
                              <TableCell>
                                {format(new Date(order.date), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>{order.orderItems.length}</TableCell>
                              <TableCell>{order.totalAmount.toFixed(2)} dt</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    const currentExpandedOrderId = expandedOrderId === order._id ? null : order._id;
                                    setExpandedOrderId(currentExpandedOrderId);
                                  }}
                                >
                                  {expandedOrderId === order._id ? 
                                    <ChevronUp className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />
                                  }
                                  {t("Items")}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedOrderId === order._id && (
                              <TableRow>
                                <TableCell colSpan={5} className="bg-muted/30 p-0">
                                  <div className="p-4">
                                    <h4 className="font-medium text-sm mb-2">{t("Order Items")}</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>{t("Item")}</TableHead>
                                          <TableHead>{t("Quantity")}</TableHead>
                                          <TableHead>{t("Price")}</TableHead>
                                          <TableHead>{t("Subtotal")}</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.orderItems.map((item) => (
                                          <TableRow key={item._id}>
                                            <TableCell>{item.item}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.price.toFixed(2)} dt</TableCell>
                                            <TableCell>{(item.quantity * item.price).toFixed(2)} dt</TableCell>
                                          </TableRow>
                                        ))}
                                        {order.discount > 0 && (
                                          <TableRow>
                                            <TableCell colSpan={3} className="text-right font-medium text-red-500">
                                              {t("Discount")}:
                                            </TableCell>
                                            <TableCell className="font-medium text-red-500">
                                              -{order.discount.toFixed(2)} dt
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-right font-medium">
                                            {t("Total")}:
                                          </TableCell>
                                          <TableCell className="font-medium">
                                            {order.totalAmount.toFixed(2)} dt
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                    </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                    </TableBody>
                  </Table>
                  </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("No order records found")}</p>
                  </div>
              )}
                </CardContent>
              </Card>
            </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("Payment History")}</CardTitle>
                  <Button 
                                variant="outline"
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setOldPaymentDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t("Add Old Payments")}
                  </Button>
                </CardHeader>
                <CardContent>
                  {client?.payments && client.payments.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>{t("Due Date")}</TableHead>
                            <TableHead>{t("Amount")}</TableHead>
                            <TableHead>{t("Status")}</TableHead>
                            <TableHead>{t("Comment")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {client.payments.sort((a, b) => 
                            new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
                          ).map((payment, i) => (
                            <TableRow key={payment._id}>
                              <TableCell className="font-medium">{i + 1}</TableCell>
                              <TableCell>
                                {format(new Date(payment.dueDate), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>{payment.amount.toFixed(2)} dt</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(payment.status)}>
                                  {t(payment.status)}
                              </Badge>
                              </TableCell>
                              <TableCell>{payment.comment || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("No payment records found")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <ClientHistoryTab clientId={clientId} />
            </TabsContent>
          </Tabs>

      {/* Defer Installment Dialog */}
      <Dialog open={deferDialog} onOpenChange={setDeferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Defer Installment")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deferDate">{t("Defer Date")}</Label>
              <Input
                id="deferDate"
                value={deferDate}
                onChange={(e) => setDeferDate(e.target.value)}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="col-span-2"
              />
              <p className="text-sm text-muted-foreground">
                {t("Select the date to defer the installment to")}
              </p>
        </div>
            <div className="grid gap-2">
              <Label htmlFor="deferReason">{t("Reason for Deferral")}</Label>
              <Input
                id="deferReason"
                value={deferReason}
                onChange={(e) => setDeferReason(e.target.value)}
                placeholder={t("Enter reason (optional)")}
                className="col-span-2"
              />
      </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeferDialog(false)} disabled={loadingAction}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleDefer} className="bg-amber-600 hover:bg-amber-700" disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Confirm Deferral")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Installment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Pay Installment")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="paymentAmount">{t("Payment Amount")}</Label>
              <Input
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="col-span-2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentComment">{t("Comment (Optional)")}</Label>
              <Input
                id="paymentComment"
                value={paymentComment}
                onChange={(e) => setPaymentComment(e.target.value)}
                placeholder={t("Add payment notes (optional)")}
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)} disabled={loadingAction}>
              {t("Cancel")}
            </Button>
            <Button onClick={handlePayment} disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Process Payment")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Installment Dialog */}
      <Dialog open={skipDialog} onOpenChange={setSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Cancel Installment")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skipComment">{t("Reason for Cancellation")}</Label>
              <Input
                id="skipComment"
                value={skipComment}
                onChange={(e) => setSkipComment(e.target.value)}
                placeholder={t("Enter reason (optional)")}
                className="col-span-2"
              />
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t("Warning: This action cannot be undone.")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialog(false)} disabled={loadingAction}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleSkip} className="bg-red-600 hover:bg-red-700" disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Confirm Cancellation")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Product Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Refund Product")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="selectedItem">{t("Select Product")}</Label>
              <Select
                value={selectedItem}
                onValueChange={setSelectedItem}
              >
                <SelectTrigger id="selectedItem">
                  <SelectValue placeholder={t("Select an item to refund")} />
                </SelectTrigger>
                <SelectContent>
                  {client.orders.flatMap(order => 
                    order.orderItems.map(item => (
                      <SelectItem key={`${order._id}-${item._id}`} value={item._id}>
                        {item.item} - {item.quantity} × {item.price.toFixed(2)} dt
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refundQuantity">{t("Quantity")}</Label>
              <Input
                id="refundQuantity"
                value={refundQuantity}
                onChange={(e) => setRefundQuantity(parseInt(e.target.value) || 1)}
                type="number"
                min="1"
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog(false)} disabled={loadingAction}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleRefund} className="bg-purple-600 hover:bg-purple-700" disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Process Refund")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Old Payments Dialog */}
      <Dialog open={oldPaymentDialog} onOpenChange={setOldPaymentDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("Add Old Payments")}</DialogTitle>
            <DialogDescription>
              {t("Record past payments for this client")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Form for adding a new old payment */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">{t("Add Payment")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paymentAmount">{t("Amount")} *</Label>
              <Input
                      id="paymentAmount"
                      value={newOldPayment.amount}
                      onChange={(e) => setNewOldPayment({...newOldPayment, amount: e.target.value})}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
              />
            </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentDate">{t("Date")} *</Label>
                    <Input
                      id="paymentDate"
                      value={newOldPayment.dueDate}
                      onChange={(e) => setNewOldPayment({...newOldPayment, dueDate: e.target.value})}
                      type="date"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentStatus">{t("Status")}</Label>
                    <Select 
                      value={newOldPayment.status} 
                      onValueChange={(value) => setNewOldPayment({...newOldPayment, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="settled">{t("Settled")}</SelectItem>
                        <SelectItem value="scheduled">{t("Scheduled")}</SelectItem>
                        <SelectItem value="deferred">{t("Deferred")}</SelectItem>
                        <SelectItem value="outstanding">{t("Outstanding")}</SelectItem>
                        <SelectItem value="abandoned">{t("Abandoned")}</SelectItem>
                      </SelectContent>
                    </Select>
            </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentComment">{t("Comment")}</Label>
                    <Input
                      id="paymentComment"
                      value={newOldPayment.comment}
                      onChange={(e) => setNewOldPayment({...newOldPayment, comment: e.target.value})}
                      placeholder={t("Add payment notes (optional)")}
                    />
                </div>
              </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={addOldPaymentToList} type="button">
                    {t("Add to List")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* List of payments to be submitted */}
              <div className="space-y-2">
              <h3 className="font-medium">{t("Payments to Submit")}</h3>
              {oldPayments.length > 0 ? (
                <div className="space-y-2">
                  {oldPayments.map((payment, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <h4 className="font-medium">{payment.amount.toFixed(2)} dt</h4>
                              <Badge className={getStatusColor(payment.status)}>
                                {t(payment.status)}
                              </Badge>
              </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.dueDate), "PPP")}
                            </p>
                            {payment.comment && (
                              <p className="text-sm mt-1">{payment.comment}</p>
            )}
          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeOldPayment(index)}>
                            <Ban className="h-4 w-4 text-muted-foreground" />
                          </Button>
                </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 text-center py-6 rounded-lg">
                  <p className="text-muted-foreground">
                    {t("No payments added yet")}
                  </p>
              </div>
            )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOldPaymentDialog(false);
              setOldPayments([]);
              setNewOldPayment({
                amount: "",
                dueDate: newOldPayment.dueDate,
                comment: "",
                status: "settled"
              });
            }} disabled={loadingAction}>
              {t("Cancel")}
            </Button>
            <Button onClick={submitOldPayments} disabled={oldPayments.length === 0 || loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Submit Payments")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Order Dialog */}
      <Dialog open={addOrderDialog} onOpenChange={setAddOrderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("Add New Orders")}</DialogTitle>
            <DialogDescription>
              {t("Create new orders for this client")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Form for adding a new order item */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <h3 className="font-medium">{t("Create New Order")}</h3>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">{t("Add Product Items")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2 md:col-span-1">
                      <Label htmlFor="productName">{t("Product Name")} *</Label>
                      <Input
                        id="productName"
                        value={newOrderItem.productName}
                        onChange={(e) => setNewOrderItem({...newOrderItem, productName: e.target.value})}
                        placeholder={t("Product name")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">{t("Quantity")} *</Label>
                      <Input
                        id="quantity"
                        value={newOrderItem.quantity}
                        onChange={(e) => setNewOrderItem({...newOrderItem, quantity: e.target.value})}
                        type="number"
                        min="1"
                        step="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unitPrice">{t("Unit Price")} *</Label>
                      <Input
                        id="unitPrice"
                        value={newOrderItem.unitPrice}
                        onChange={(e) => setNewOrderItem({...newOrderItem, unitPrice: e.target.value})}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button onClick={addOrderItemToList} type="button" size="sm">
                      {t("Add Item")}
                    </Button>
                  </div>
            </div>

                {/* List of items in this order */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium">{t("Current Order Items")}</h4>
                  {orderItems.length > 0 ? (
              <div className="space-y-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>{t("Product")}</TableHead>
                            <TableHead>{t("Quantity")}</TableHead>
                            <TableHead>{t("Price")}</TableHead>
                            <TableHead>{t("Subtotal")}</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unitPrice.toFixed(2)} dt</TableCell>
                              <TableCell>{(item.quantity * item.unitPrice).toFixed(2)} dt</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeOrderItem(index)}>
                                  <Ban className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-medium">
                              {t("Items Subtotal")}:
                            </TableCell>
                            <TableCell className="font-medium">
                              {orderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0).toFixed(2)} dt
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          {parseFloat(orderDiscount) > 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium text-red-500">
                                {t("Discount")}:
                              </TableCell>
                              <TableCell className="font-medium text-red-500">
                                -{parseFloat(orderDiscount).toFixed(2)} dt
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-medium text-primary">
                              {t("Grand Total")}:
                            </TableCell>
                            <TableCell className="font-medium text-primary">
                              {Math.max(0, orderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0) - parseFloat(orderDiscount || "0")).toFixed(2)} dt
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                </div>
                  ) : (
                    <div className="bg-muted/50 text-center py-4 rounded-lg">
                      <p className="text-muted-foreground text-sm">
                        {t("No items added yet")}
                      </p>
              </div>
            )}
                </div>

                {/* Order details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">{t("Payment Terms")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="orderDate">{t("Order Date")}</Label>
              <Input
                        id="orderDate"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
              />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="orderDiscount">{t("Discount")}</Label>
                      <Input
                        id="orderDiscount"
                        value={orderDiscount}
                        onChange={(e) => setOrderDiscount(e.target.value)}
                        type="number"
                        min="0"
                        step="0.01"
                      />
                  </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="orderComment">{t("Order Comment")}</Label>
                      <Input
                        id="orderComment"
                        value={orderComment}
                        onChange={(e) => setOrderComment(e.target.value)}
                        placeholder={t("Add order notes (optional)")}
                      />
                </div>
              </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button onClick={addOrderToList} type="button" disabled={orderItems.length === 0}>
                    {t("Save Order to List")}
                  </Button>
            </div>
              </CardContent>
            </Card>

            {/* List of orders to be submitted */}
            <div className="space-y-2 mt-6">
              <h3 className="font-medium">{t("Orders to Submit")}</h3>
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <h4 className="font-medium">{order.totalAmount.toFixed(2)} dt</h4>
                            <Badge variant="secondary">{order.items.length} {t("items")}</Badge>
          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeOrder(index)}>
                            <Ban className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>{t("Order Date")}: {format(new Date(order.date), "PPP")}</p>
                          {order.discount > 0 && (
                            <p>{t("Discount")}: {order.discount.toFixed(2)} dt</p>
                          )}
                          {order.comment && <p>{t("Comment")}: {order.comment}</p>}
                        </div>
                        <Collapsible className="mt-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-1 h-7">
                              <ChevronDown className="h-4 w-4" />
                              {t("View Items")}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <Table className="mt-2">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("Product")}</TableHead>
                                  <TableHead>{t("Qty")}</TableHead>
                                  <TableHead>{t("Price")}</TableHead>
                                  <TableHead>{t("Subtotal")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items.map((item, itemIndex) => (
                                  <TableRow key={itemIndex}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.unitPrice.toFixed(2)} dt</TableCell>
                                    <TableCell>{(item.quantity * item.unitPrice).toFixed(2)} dt</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={3} className="text-right font-medium">
                                    {t("Items Subtotal")}:
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {order.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0).toFixed(2)} dt
                                  </TableCell>
                                </TableRow>
                                {order.discount > 0 && (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium text-red-500">
                                      {t("Discount")}:
                                    </TableCell>
                                    <TableCell className="font-medium text-red-500">
                                      -{order.discount.toFixed(2)} dt
                                    </TableCell>
                                  </TableRow>
                                )}
                                <TableRow>
                                  <TableCell colSpan={3} className="text-right font-medium text-primary">
                                    {t("Grand Total")}:
                                  </TableCell>
                                  <TableCell className="font-medium text-primary">
                                    {order.totalAmount.toFixed(2)} dt
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 text-center py-6 rounded-lg">
                  <p className="text-muted-foreground">
                    {t("No orders added yet")}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddOrderDialog(false);
              setOrders([]);
              setOrderItems([]);
              setOrderComment("");
              // Don't reset the date - keep it for next order
              setOrderDiscount("0");
            }} disabled={loadingAction}>
              {t("Cancel")}
            </Button>
            <Button 
              onClick={submitOrders} 
              disabled={(orders.length === 0 && orderItems.length === 0) || loadingAction}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Processing...")}
                </>
              ) : (
                t("Submit Orders")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">{t("Delete Client")}</DialogTitle>
            <DialogDescription>
              {t("This action cannot be undone. This will permanently delete the client and all associated data.")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deleteConfirmation">
                {t("Please type")} <span className="font-bold">{client?.fullName}</span> {t("to confirm")}
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="col-span-2"
              />
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t("Warning: All client data including orders and payments will be permanently deleted.")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialog(false);
              setDeleteConfirmation("");
            }} disabled={deleteLoading}>
              {t("Cancel")}
            </Button>
            <Button 
              onClick={handleDeleteClient} 
              className="bg-red-600 hover:bg-red-700" 
              disabled={deleteConfirmation !== client?.fullName || deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Deleting...")}
                </>
              ) : (
                t("Delete Client")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
