
export interface SaleItem {
  product: string;
  title: string;
  quantity: number;
  price: number;
  _id: string;
}
export interface Order {
  sale: {
    items: SaleItem[];
    discount: number;
    total: number;
    formPayment: string;
  };
  customer: string;
  number: string;
  createDate: Date;
  payments: Payment[];
}
export interface PaymentTotal {
  formPayment: string;
  color: any;
  total: number;
}
export interface Payment {
  method: string;  // Forma de pagamento, como "débito", "dinheiro", etc.
  amount: number;  // Quantia paga com esse método
  _id: string;     // Id do pagamento
}
