export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummary {
  orderId: string;
  status: string;
  createdAt: string;
  currency: string;
  subtotal: number;
  items: OrderItem[];
}
