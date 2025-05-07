import type { Payment } from "@/types/Payment";
import type { Client } from "@/types/Client";
import type { Order } from "@/types/Order";
import { applyAuthHeader } from './authService';

const API_BASE_URL = 'https://client-tracker-back.onrender.com/api';

// Mock data for fallback when API is not available
const mockPayments: Payment[] = [
  {
    id: 1,
    order_id: 1,
    client_id: 1,
    amount: 150,
    status: "completed",
    due_date: new Date("2024-05-15"),
    paid_date: new Date("2024-05-15"),
    deferred_days: 0,
    created_at: new Date("2024-05-01"),
    updated_at: new Date("2024-05-15"),
    progress: 100,
    client: {
      id: 1,
      name: "Asma Jomaa",
      email: "asma@example.com"
    }
  },
  {
    id: 2,
    order_id: 1,
    client_id: 1,
    amount: 150,
    status: "scheduled",
    due_date: new Date("2024-06-15"),
    paid_date: null,
    deferred_days: 0,
    created_at: new Date("2024-05-01"),
    updated_at: new Date("2024-05-01"),
    progress: 50,
    client: {
      id: 1,
      name: "Asma Jomaa",
      email: "asma@example.com"
    }
  },
  {
    id: 3,
    order_id: 2,
    client_id: 2,
    amount: 200,
    status: "deferred",
    due_date: new Date("2024-05-20"),
    paid_date: null,
    deferred_days: 10,
    created_at: new Date("2024-04-15"),
    updated_at: new Date("2024-05-10"),
    progress: 30,
    client: {
      id: 2,
      name: "Bouzomita Ahmed",
      email: "ahmed@example.com"
    }
  },
  {
    id: 4,
    order_id: 3,
    client_id: 3,
    amount: 85,
    status: "outstanding",
    due_date: new Date("2024-05-05"),
    paid_date: null,
    deferred_days: 0,
    created_at: new Date("2024-04-20"),
    updated_at: new Date("2024-05-06"),
    progress: 0,
    client: {
      id: 3,
      name: "Toumi Naima",
      email: "naima@example.com"
    }
  },
  {
    id: 5,
    order_id: 4,
    client_id: 2,
    amount: 120,
    status: "settled",
    due_date: new Date("2024-05-10"),
    paid_date: new Date("2024-05-10"),
    deferred_days: 0,
    created_at: new Date("2024-04-25"),
    updated_at: new Date("2024-05-10"),
    progress: 100,
    client: {
      id: 2,
      name: "Bouzomita Ahmed",
      email: "ahmed@example.com"
    }
  },
  {
    id: 6,
    order_id: 5,
    client_id: 4,
    amount: 70,
    status: "abandoned",
    due_date: new Date("2024-05-01"),
    paid_date: null,
    deferred_days: 0,
    created_at: new Date("2024-04-10"),
    updated_at: new Date("2024-05-02"),
    progress: 0,
    client: {
      id: 4,
      name: "Bouzomita Ali",
      email: "ali@example.com"
    }
  }
];

const mockClients: Client[] = [
  {
    _id: "681904ac8f00c1262d31f045",
    fullName: "Asma Jomaa",
    phoneNumber: "+216 55 123 456",
    score: 85,
    status: "settled",
    created_at: new Date("2023-12-01"),
    updated_at: new Date("2024-01-15"),
  },
  {
    _id: "681904ac8f00c1262d31f046",
    fullName: "Bouzomita Ahmed",
    phoneNumber: "+216 55 789 012",
    score: 92,
    status: "deferred",
    created_at: new Date("2023-11-15"),
    updated_at: new Date("2024-01-20"),
  },
  {
    _id: "681904ac8f00c1262d31f047",
    fullName: "Toumi Naima",
    email: "naima@example.com",
    phoneNumber: "+216 55 456 789",
    score: 78,
    status: "scheduled",
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-02-10"),
  },
  {
    _id: "681904ac8f00c1262d31f048",
    fullName: "Bouzomita Ali",
    email: "ali@example.com",
    phoneNumber: "+216 55 321 654",
    score: 65,
    status: "deferred",
    created_at: new Date("2023-10-20"),
    updated_at: new Date("2024-03-15"),
  }
];

const mockOrders: Order[] = [
  {
    id: 1,
    client_id: 1,
    total_amount: 300,
    status: "completed",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-02-15"),
    client: {
      name: "Asma Jomaa",
      email: "asma@example.com",
    },
  },
  {
    id: 2,
    client_id: 2,
    total_amount: 200,
    status: "pending",
    created_at: new Date("2024-04-15"),
    updated_at: new Date("2024-04-15"),
    client: {
      name: "Bouzomita Ahmed",
      email: "ahmed@example.com",
    },
  },
  {
    id: 3,
    client_id: 3,
    total_amount: 85,
    status: "completed",
    created_at: new Date("2024-04-20"),
    updated_at: new Date("2024-05-06"),
    client: {
      name: "Toumi Naima",
      email: "naima@example.com",
    },
  },
  {
    id: 4,
    client_id: 2,
    total_amount: 120,
    status: "completed",
    created_at: new Date("2024-04-25"),
    updated_at: new Date("2024-05-10"),
    client: {
      name: "Bouzomita Ahmed",
      email: "ahmed@example.com",
    },
  },
  {
    id: 5,
    client_id: 4,
    total_amount: 70,
    status: "cancelled",
    created_at: new Date("2024-04-10"),
    updated_at: new Date("2024-05-02"),
    client: {
      name: "Bouzomita Ali",
      email: "ali@example.com",
    },
  }
];

/**
 * Generic fetch function with error handling and fallback
 */
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {},
  mockData?: T
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Apply auth headers to all requests
  const headersWithAuth = applyAuthHeader(defaultHeaders);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headersWithAuth,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // If unauthorized (401), might need to handle token refresh or redirect to login
      if (response.status === 401 && typeof window !== 'undefined') {
        console.log('Authentication failed, redirecting to login');
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirect will be handled by ProtectedRoute
      }
      
      if (mockData) {
        console.log(`API endpoint ${endpoint} returned ${response.status}, using mock data instead`);
        return mockData;
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (mockData) {
      console.log(`Error fetching from ${endpoint}, using mock data instead:`, error);
      return mockData;
    }
    throw error;
  }
}

/**
 * Payment related API calls
 */
export const PaymentAPI = {
  // Get all payments
  getAll: async (): Promise<Payment[]> => {
    try {
      const url = `${API_BASE_URL}/payments`;
      const headers = applyAuthHeader({ 'Content-Type': 'application/json' });
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
        
        console.log(`API returned ${response.status}, using mock data instead`);
        return mockPayments;
      }
      
      return await response.json();
    } catch (error) {
      console.log(`Error fetching payments, using mock data instead:`, error);
      return mockPayments;
    }
  },
  
  // Get payments by status
  getByStatus: async (status: string): Promise<Payment[]> => {
    const filteredMockPayments = mockPayments.filter(p => p.status === status);
    return fetchAPI<Payment[]>(`/payments?status=${status}`, {}, filteredMockPayments);
  },
  
  // Get a single payment by ID
  getById: async (id: number): Promise<Payment> => {
    const mockPayment = mockPayments.find(p => p.id === id);
    if (!mockPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    return fetchAPI<Payment>(`/payments/${id}`, {}, mockPayment);
  },
  
  // Update a payment status
  updateStatus: async (id: number, status: string): Promise<Payment> => {
    const mockPayment = mockPayments.find(p => p.id === id);
    if (!mockPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    // Validate that status is one of the allowed values
    const validStatuses: Payment['status'][] = ["scheduled", "completed", "deferred", "abandoned", "outstanding", "settled"];
    if (!validStatuses.includes(status as Payment['status'])) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    const updatedPayment: Payment = { 
      ...mockPayment, 
      status: status as Payment['status']
    };
    
    return fetchAPI<Payment>(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, updatedPayment);
  },
  
  // Complete a payment
  complete: async (id: number, amount: number): Promise<Payment> => {
    const mockPayment = mockPayments.find(p => p.id === id);
    if (!mockPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    const updatedPayment: Payment = { 
      ...mockPayment, 
      status: "completed", 
      paid_date: new Date(),
      progress: 100,
      amount: amount || mockPayment.amount
    };
    return fetchAPI<Payment>(`/payments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    }, updatedPayment);
  },
  
  // Defer a payment
  defer: async (id: number, deferredDays: number): Promise<Payment> => {
    const mockPayment = mockPayments.find(p => p.id === id);
    if (!mockPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    const dueDate = new Date(mockPayment.due_date);
    dueDate.setDate(dueDate.getDate() + deferredDays);
    
    const updatedPayment: Payment = { 
      ...mockPayment, 
      status: "deferred",
      due_date: dueDate,
      deferred_days: mockPayment.deferred_days + deferredDays
    };
    return fetchAPI<Payment>(`/payments/${id}/defer`, {
      method: 'POST',
      body: JSON.stringify({ deferredDays })
    }, updatedPayment);
  },
  
  // Abandon a payment
  abandon: async (id: number): Promise<Payment> => {
    const mockPayment = mockPayments.find(p => p.id === id);
    if (!mockPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    const updatedPayment: Payment = { 
      ...mockPayment, 
      status: "abandoned", 
      progress: 0 
    };
    return fetchAPI<Payment>(`/payments/${id}/abandon`, {
      method: 'POST'
    }, updatedPayment);
  }
};

/**
 * Client related API calls
 */
export const ClientAPI = {
  // Get all clients
  getAll: async (): Promise<Client[]> => {
    return fetchAPI<Client[]>('/clients', {}, mockClients);
  },
  
  // Get a single client by ID
  getById: async (id: number): Promise<Client> => {
    const mockClient = mockClients.find(c => c.id === id);
    if (!mockClient) {
      throw new Error(`Client with ID ${id} not found`);
    }
    return fetchAPI<Client>(`/clients/${id}`, {}, mockClient);
  },
  
  // Get a client's payments
  getPayments: async (id: number): Promise<Payment[]> => {
    const clientPayments = mockPayments.filter(p => p.client_id === id);
    return fetchAPI<Payment[]>(`/clients/${id}/payments`, {}, clientPayments);
  }
};

/**
 * Order related API calls
 */
export const OrderAPI = {
  // Get all orders
  getAll: async (): Promise<Order[]> => {
    return fetchAPI<Order[]>('/orders', {}, mockOrders);
  },
  
  // Get a single order by ID
  getById: async (id: number): Promise<Order> => {
    const mockOrder = mockOrders.find(o => o.id === id);
    if (!mockOrder) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return fetchAPI<Order>(`/orders/${id}`, {}, mockOrder);
  },
  
  // Get order payments
  getPayments: async (id: number): Promise<Payment[]> => {
    const orderPayments = mockPayments.filter(p => p.order_id === id);
    return fetchAPI<Payment[]>(`/orders/${id}/payments`, {}, orderPayments);
  }
}; 