import { authHeader } from "@/utils/auth";
import {
  Client,
  ClientsResponse,
  ClientResponse,
  ClientParams,
  CreateClientData,
  LocationInfo,
  ClientPayment,
  ClientOrder,
} from "@/types/Client";

// Set the full API URL for better reliability
const API_URL = "https://client-tracker-back.onrender.com/api";

export class ClientService {
  static async getClients(params: ClientParams = {}): Promise<ClientsResponse> {
    const queryParams = new URLSearchParams();

    if (params.populate) queryParams.append("populate", params.populate);
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_URL}/clients?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to fetch clients: ${response.statusText}`,
          data: {
            docs: [],
            meta: {
              limit: params.limit || 10,
              hasPrevPage: false,
              hasNextPage: false,
              hasMore: false,
              totalDocs: 0,
              totalPages: 0,
              page: params.page || 1,
              pagingCounter: 1,
            },
          },
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching clients:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        data: {
          docs: [],
          meta: {
            limit: params.limit || 10,
            hasPrevPage: false,
            hasNextPage: false,
            hasMore: false,
            totalDocs: 0,
            totalPages: 0,
            page: params.page || 1,
            pagingCounter: 1,
          },
        },
      };
    }
  }

  static async getClientById(id: string): Promise<ClientResponse> {
    const url = `${API_URL}/clients/${id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to fetch client: ${response.statusText}`,
          data: {} as Client,
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching client:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        data: {} as Client,
      };
    }
  }

  static async createClient(
    clientData: CreateClientData
  ): Promise<ClientResponse> {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: "POST",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message || `Failed to create client: ${response.statusText}`,
          data: {} as Client,
        };
      }

      return data;
    } catch (error) {
      console.error("Error creating client:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        data: {} as Client,
      };
    }
  }

  static async updateClient(
    id: string,
    clientData: Partial<CreateClientData>
  ): Promise<ClientResponse> {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: "PUT",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message || `Failed to update client: ${response.statusText}`,
          data: {} as Client,
        };
      }

      return data;
    } catch (error) {
      console.error("Error updating client:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        data: {} as Client,
      };
    }
  }

  static async deleteClient(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message || `Failed to delete client: ${response.statusText}`,
        };
      }

      return {
        success: true,
        message: "Client deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting client:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  // Utility methods for client data
  static getClientTotalSpent(client: Client): number {
    return client.orders.reduce((total, order) => total + order.totalAmount, 0);
  }

  static getClientPaidAmount(client: Client): number {
    return client.payments
      .filter(
        (payment) =>
          payment.status === "settled" || payment.status === "completed"
      )
      .reduce((total, payment) => total + payment.amount, 0);
  }

  static getClientOutstandingAmount(client: Client): number {
    const totalSpent = this.getClientTotalSpent(client);
    const paidAmount = this.getClientPaidAmount(client);
    return Math.max(0, totalSpent - paidAmount);
  }

  static getLastOrderDate(client: Client): string | null {
    if (client.orders.length === 0) return null;

    const sortedOrders = [...client.orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedOrders[0].createdAt;
  }

  static getNextPaymentDate(client: Client): string | null {
    const scheduledPayments = client.payments
      .filter((payment) => payment.status === "scheduled")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    return scheduledPayments.length > 0 ? scheduledPayments[0].dueDate : null;
  }

  static async getClientsByDay(day: string): Promise<ClientsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("day", day);

    const url = `${API_URL}/clients/day?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to fetch clients by day: ${response.statusText}`,
          data: {
            docs: [],
            meta: {
              limit: 10,
              hasPrevPage: false,
              hasNextPage: false,
              hasMore: false,
              totalDocs: 0,
              totalPages: 0,
              page: 1,
              pagingCounter: 1,
            },
          },
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching clients by day:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        data: {
          docs: [],
          meta: {
            limit: 10,
            hasPrevPage: false,
            hasNextPage: false,
            hasMore: false,
            totalDocs: 0,
            totalPages: 0,
            page: 1,
            pagingCounter: 1,
          },
        },
      };
    }
  }
}
