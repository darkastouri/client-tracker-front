import { authHeader } from "@/utils/auth";
import { format } from "date-fns";

// Define activity types enum
export enum ActivityType {
  PAYMENT = 'payment',
  DEFERRAL = 'deferral',
  ABANDONMENT = 'abandonment',
  IGNORE = 'ignore',
  PURCHASE = 'purchase',
  REFUND = 'refund',
}

// Define history item interface
export interface HistoryItem {
  _id: string;
  activity: ActivityType;
  details: {
    date?: string;
    amount?: number;
    refundedItem?: any;
    items?: any[];
  };
  provider?: {
    _id: string;
    name: string;
  };
  client?: {
    _id: string;
    fullName: string;
  };
  timestamp: string;
}

// Define history response interface
export interface HistoryResponse {
  success: boolean;
  data: {
    docs: HistoryItem[];
    meta: {
      totalDocs: number;
      limit: number;
      totalPages: number;
      page: number;
      pagingCounter: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      prevPage: number | null;
      nextPage: number | null;
    };
  };
  message: string;
}

// Define history query parameters interface
export interface HistoryParams {
  from: string; // Required: YYYY-MM-DD
  to: string;   // Required: YYYY-MM-DD
  client?: string;
  activity?: ActivityType;
  populate?: string;
  page?: string;
  limit?: string;
}

export class HistoryService {
  private static BASE_URL = "https://client-tracker-back.onrender.com/api";

  /**
   * Get global history with filters
   */
  static async getHistory(params: HistoryParams): Promise<HistoryResponse> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      
      // Add required params
      queryParams.append("from", params.from);
      queryParams.append("to", params.to);
      
      // Add optional params
      if (params.client) queryParams.append("client", params.client);
      if (params.activity) queryParams.append("activity", params.activity);
      if (params.populate !== undefined) queryParams.append("populate", params.populate.toString());
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      
      const response = await fetch(`${this.BASE_URL}/history?${queryParams.toString()}`, {
        method: "GET",
        headers: authHeader(),
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data: data.data || { docs: [], meta: { totalDocs: 0, limit: 10, totalPages: 0, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null } },
        message: response.ok ? "History fetched successfully" : data.message || "Failed to fetch history",
      };
    } catch (error) {
      console.error("Error fetching history:", error);
      return {
        success: false,
        data: { docs: [], meta: { totalDocs: 0, limit: 10, totalPages: 0, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null } },
        message: "An error occurred while fetching history",
      };
    }
  }

  /**
   * Get client-specific history
   */
  static async getClientHistory(clientId: string, params: Omit<HistoryParams, 'client'>): Promise<HistoryResponse> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      
      // Add required params
      queryParams.append("from", params.from);
      queryParams.append("to", params.to);
      
      // Add optional params
      if (params.activity) queryParams.append("activity", params.activity);
      if (params.populate !== undefined) queryParams.append("populate", params.populate.toString());
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      
      const response = await fetch(`${this.BASE_URL}/history/${clientId}?${queryParams.toString()}`, {
        method: "GET",
        headers: authHeader(),
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data: data.data || { docs: [], meta: { totalDocs: 0, limit: 10, totalPages: 0, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null } },
        message: response.ok ? "Client history fetched successfully" : data.message || "Failed to fetch client history",
      };
    } catch (error) {
      console.error("Error fetching client history:", error);
      return {
        success: false,
        data: { docs: [], meta: { totalDocs: 0, limit: 10, totalPages: 0, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null } },
        message: "An error occurred while fetching client history",
      };
    }
  }

  /**
   * Helper method to format date for API params
   */
  static formatDateParam(date: Date): string {
    return format(date, "yyyy-MM-dd");
  }
} 