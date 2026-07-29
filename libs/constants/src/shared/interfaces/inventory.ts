export interface InventoryItemShape {
  id: number;
  name: string;
  quantity: number;
}

export interface UpdateStockPayload {
  productId: number;
  quantity: number;
}
