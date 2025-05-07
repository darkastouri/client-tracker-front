"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, CreditCard, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/useTranslation"
import { useToast } from "@/hooks/useToast"
import { authHeader } from "@/utils/auth"

interface ClientActionPopupProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: number | string
    name: string
    amount: number
    dueDate: string
    status?: string
  }
}

export function ClientActionPopup({ isOpen, onClose, client }: ClientActionPopupProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"pay" | "defer" | "abandon">("pay")
  const [paymentAmount, setPaymentAmount] = useState(client.amount.toString())
  const [paymentNotes, setPaymentNotes] = useState("")
  const [deferDate, setDeferDate] = useState("")
  const [deferReason, setDeferReason] = useState("")
  const [abandonReason, setAbandonReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Check if the payment is in a finalized state (settled, abandoned, or deferred)
  const isPaymentFinalized = client.status === "settled" || client.status === "abandoned" || client.status === "deferred"

  const handlePayment = async () => {
    if (!paymentAmount) {
      toast({
        title: t("Error"),
        description: t("Please enter a payment amount"),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${client.id}/pay`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          comment: paymentNotes || ""
        }),
      });
      
      if (response.ok) {
        toast({
          title: t("Payment successful"),
          description: t("The payment has been processed successfully."),
        });
        
        // Refresh the page to show updated data
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: t("Payment failed"),
          description: errorData.message || t("An error occurred while processing the payment."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: t("Payment failed"),
        description: t("An error occurred while processing the payment."),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
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

    setIsProcessing(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${client.id}/skip`, {
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
        
        // Refresh the page to show updated data
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: t("Deferral failed"),
          description: errorData.message || t("An error occurred while deferring the installment."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Deferral error:", error);
      toast({
        title: t("Deferral failed"),
        description: t("An error occurred while deferring the installment."),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  }

  const handleAbandon = async () => {
    if (!abandonReason) {
      toast({
        title: t("Error"),
        description: t("Please enter a reason for abandonment"),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/payments/${client.id}/cancel`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: abandonReason
        }),
      });
      
      if (response.ok) {
        toast({
          title: t("Installment cancelled"),
          description: t("The installment has been cancelled successfully."),
        });
        
        // Refresh the page to show updated data
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: t("Cancellation failed"),
          description: errorData.message || t("An error occurred while cancelling the installment."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: t("Cancellation failed"),
        description: t("An error occurred while cancelling the installment."),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  }

  const handleViewProfile = () => {
    router.push(`/dashboard/clients/profile/${client.id}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {t("Payment due on")} {client.dueDate}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        {isPaymentFinalized ? (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {t("This payment is already")} 
                <span className="font-semibold">
                  {client.status === "settled" ? t("settled") : 
                   client.status === "abandoned" ? t("cancelled") : 
                   t("deferred")}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("No actions are available for this payment")}
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {t("Close")}
              </Button>
              <Button onClick={handleViewProfile}>
                {t("View Profile")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="flex border-b">
              <Button
                variant={activeTab === "pay" ? "default" : "ghost"}
                className="flex-1 rounded-none border-b-2 border-transparent px-0 py-2"
                onClick={() => setActiveTab("pay")}
                data-active={activeTab === "pay"}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t("Pay Installment")}
              </Button>
              <Button
                variant={activeTab === "defer" ? "default" : "ghost"}
                className="flex-1 rounded-none border-b-2 border-transparent px-0 py-2"
                onClick={() => setActiveTab("defer")}
                data-active={activeTab === "defer"}
              >
                <Clock className="mr-2 h-4 w-4" />
                {t("Defer Installment")}
              </Button>
              <Button
                variant={activeTab === "abandon" ? "default" : "ghost"}
                className="flex-1 rounded-none border-b-2 border-transparent px-0 py-2"
                onClick={() => setActiveTab("abandon")}
                data-active={activeTab === "abandon"}
              >
                <Clock className="mr-2 h-4 w-4" />
                {t("Abandon Installment")}
              </Button>
            </div>

            <div className="py-4">
              {activeTab === "pay" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("Payment Amount")}</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-notes">{t("Notes")}</Label>
                    <Input
                      id="payment-notes"
                      placeholder={t("Add payment notes (optional)")}
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "defer" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defer-date">{t("Defer Date")}</Label>
                    <Input 
                      id="defer-date" 
                      type="date" 
                      value={deferDate} 
                      onChange={(e) => setDeferDate(e.target.value)} 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defer-reason">{t("Reason for Deferral")}</Label>
                    <Input
                      id="defer-reason"
                      placeholder={t("Enter reason (optional)")}
                      value={deferReason}
                      onChange={(e) => setDeferReason(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "abandon" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="abandon-reason">{t("Reason for Cancellation")}</Label>
                    <Input
                      id="abandon-reason"
                      placeholder={t("Enter reason")}
                      value={abandonReason}
                      onChange={(e) => setAbandonReason(e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 p-4 text-amber-800 dark:text-amber-200">
                    <p>{t("Warning: This action cannot be undone.")}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
              <Button variant="outline" onClick={handleViewProfile}>
                {t("View Profile")}
              </Button>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button variant="outline" onClick={onClose}>
                  {t("Cancel")}
                </Button>
                {activeTab === "pay" && (
                  <Button onClick={handlePayment} disabled={!paymentAmount || isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Processing...")}
                      </>
                    ) : (
                      t("Process Payment")
                    )}
                  </Button>
                )}
                {activeTab === "defer" && (
                  <Button onClick={handleDefer} disabled={!deferDate || isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Processing...")}
                      </>
                    ) : (
                      t("Confirm Deferral")
                    )}
                  </Button>
                )}
                {activeTab === "abandon" && (
                  <Button variant="destructive" onClick={handleAbandon} disabled={!abandonReason || isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Processing...")}
                      </>
                    ) : (
                      t("Confirm Cancellation")
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
