import { OrderStatus, Order as OrderShape } from '@app/constants';

export { OrderStatus };

export class Order implements OrderShape {
  id!: number;
  name!: string;
  productId!: number;
  price!: number;
  status!: OrderStatus;
  quantity!: number;
}
