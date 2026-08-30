export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  expiryDate: string;
  riskLevel: 'NORMAL' | 'AT_RISK' | 'URGENT';
  createdAt: string;
}

export interface RescueOffer {
  id: string;
  batchId: string;
  batch?: Batch;
  originalPrice: number;
  discountPrice: number;
  quantityAvailable: number;
  status: 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  rescueOfferId: string;
  rescueOffer?: RescueOffer;
  customerId: string;
  customer?: Customer;
  quantity: number;
  status: 'RESERVED' | 'PAID' | 'EXPIRED';
  reservedAt: string;
  expiresAt: string;
}

export interface Order {
  id: string;
  reservationId: string;
  reservation?: Reservation;
  totalAmount: number;
  status: 'PAID' | 'PICKED_UP';
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'RESERVATION_CONFIRMED' | 'PAYMENT_SUCCESS' | 'READY_FOR_PICKUP' | 'BATCH_URGENT';
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedOrderId?: string;
  relatedBatchId?: string;
}

export async function markOrderPickedUp(id: string): Promise<Order> {
  return fetcher(`/orders/${id}/pickup`, { method: 'PATCH' });
}

export async function createOrder(dto: { reservationId: string; totalAmount: number; status: string }): Promise<Order> {
  return fetcher('/orders', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return fetcher(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(recipientId: string): Promise<any> {
  return fetcher(`/notifications/recipient/${recipientId}/read-all`, { method: 'PATCH' });
}

export async function getNotificationsByRecipient(recipientId: string): Promise<Notification[]> {
  return fetcher(`/notifications/recipient/${recipientId}`);
}
