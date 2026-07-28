export enum OrderStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface Order {
  id: number;
  name: string;
  productId: number;
  price: number;
  status: OrderStatus;
  quantity: number;
}

export interface OrderProcessedPayload {
  orderId: number;
  success: boolean;
  message: string;
}
