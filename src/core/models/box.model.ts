import { BoxItem } from "./box-item.model";

export class Cart {
  items: BoxItem[] = [];
  paymentForm?: string;
  generalDiscount?: number = 0;
  total?: number;
  customerName?: string;

  constructor() {
    this.items = [];
    this.paymentForm = '';
  }
}
