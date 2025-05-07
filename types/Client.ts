export interface LocationInfo {
  location: string;
  longitude: number;
  latitude: number;
}

export interface OrderItem {
  _id: string;
  item: string;
  price: number;
  quantity: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientOrder {
  _id: string;
  totalAmount: number;
  orderItems: OrderItem[];
  discount: number;
  date: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPayment {
  _id: string;
  comment: string;
  amount: number;
  client: string;
  status: "scheduled" | "settled" | "deferred" | "outstanding" | "abandoned" | "completed";
  dueDate: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  fullName: string;
  locationInfo: LocationInfo;
  description: string;
  status: "scheduled" | "settled" | "deferred" | "outstanding" | "abandoned" | "completed";
  phoneNum: number;
  orders: ClientOrder[];
  payments: ClientPayment[];
  tags: string[];
  provider: string;
  installment: number;
  paymentDay: number;
  score: number;
  maxScore?: number; 
  deletedAt: string | null;
  savedAt: string | null;
  hiddenAt: string | null;
  createdAt: string;
  updatedAt: string;
  paidAmount: number;
  totalAmount: number;
}

export interface ClientsResponse {
  success: boolean;
  message: string;
  data: {
    docs: Client[];
    meta: {
      limit: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      hasMore: boolean;
      totalDocs: number;
      totalPages: number;
      page: number;
      pagingCounter: number;
    };
  };
}

export interface ClientResponse {
  success: boolean;
  message: string;
  data: Client;
}

export interface ClientParams {
  populate?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateClientData {
  fullName: string;
  description: string;
  locationInfo: LocationInfo;
  phoneNum: number;
  tags: string[];
  installment: number;
  paymentDay: number;
}
