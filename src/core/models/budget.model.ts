export interface Item {
  product: string;
  title: string;
  quantity: number;
  price: number;
  _id: string;
}
export interface Budget {
  budget: {
    items: Item[];
    total: number;
  };
  _id: string;
  client: string;
  number: string;
  createDate: Date;
}
