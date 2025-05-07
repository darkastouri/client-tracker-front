"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/useToast"
import { useTranslation } from "@/hooks/useTranslation"
import { ClientService } from "@/services/clientService"
import { Client } from "@/types/Client"
import { authHeader } from "@/utils/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define the form schema that matches the API schema
const editClientSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(40, "Name must be at most 40 characters"),
  description: z.string().min(2, "Description must be at least 2 characters").max(350, "Description must be at most 350 characters"),
  locationInfo: z.object({
    location: z.string(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
  }),
  phoneNum: z.number(),
  tags: z.array(z.string()),
  installment: z.number().min(10, "Installment must be at least 10"),
  paymentDay: z.number().min(1, "Payment day must be between 1 and 31").max(31, "Payment day must be between 1 and 31"),
});

type EditClientFormValues = z.infer<typeof editClientSchema>;

export default function EditClientPage() {
  const params = useParams()
  const clientId = params.id as string
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [tagInput, setTagInput] = useState<string>("")
  
  // Initialize the form
  const form = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      fullName: "",
      description: "",
      locationInfo: {
        location: "",
        longitude: 0,
        latitude: 0,
      },
      phoneNum: 0,
      tags: [],
      installment: 0,
      paymentDay: 1,
    },
  });
  
  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await ClientService.getClientById(clientId);
        
        if (response.success && response.data) {
          setClient(response.data);
          
          // Pre-fill the form with client data
          form.reset({
            fullName: response.data.fullName,
            description: response.data.description || "",
            locationInfo: {
              location: response.data.locationInfo?.location || "",
              longitude: response.data.locationInfo?.longitude || 0,
              latitude: response.data.locationInfo?.latitude || 0,
            },
            phoneNum: response.data.phoneNum || 0,
            tags: response.data.tags || [],
            installment: response.data.installment || 0,
            paymentDay: response.data.paymentDay || 1,
          });
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
  }, [clientId, form]);
  
  const onSubmit = async (data: EditClientFormValues) => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`https://client-tracker-back.onrender.com/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        toast({
          title: t("Client updated"),
          description: t("The client has been updated successfully."),
        });
        
        // Redirect back to client profile
        router.push(`/dashboard/clients/profile/${clientId}`);
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
            title: t("Update failed"),
            description: errorData.message || t("An error occurred while updating the client."),
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: t("Update failed"),
        description: t("An error occurred while updating the client."),
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to add a tag
  const addTag = () => {
    if (tagInput.trim() === "") return;
    
    const currentTags = form.getValues("tags");
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
    }
    
    setTagInput("");
  };
  
  // Helper function to remove a tag
  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(t => t !== tag));
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
          <h2 className="text-2xl font-bold tracking-tight">{t("Edit Client")}</h2>
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
          <h2 className="text-2xl font-bold tracking-tight">{t("Edit Client")}</h2>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Basic Information")}</CardTitle>
              <CardDescription>{t("Edit the client's basic information")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Full Name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Phone Number")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Description")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("Location Information")}</CardTitle>
              <CardDescription>{t("Edit the client's location details")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="locationInfo.location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Location")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="locationInfo.longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Longitude")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.000001" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="locationInfo.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Latitude")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.000001" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("Payment Information")}</CardTitle>
              <CardDescription>{t("Edit the client's payment details")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="installment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Installment Amount")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="10" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Payment Day")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="31" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("Day of the month when payment is due (1-31)")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("Tags")}</CardTitle>
              <CardDescription>{t("Add tags to categorize this client")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {form.watch("tags").map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-1 rounded-full"
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
                {form.watch("tags").length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("No tags added")}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={t("Add a tag...")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  {t("Add")}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Saving...")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save Changes")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 