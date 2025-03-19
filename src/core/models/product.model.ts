import { Supplier } from './supplier-model';

export class Product {
  constructor(
    public _id: string,
    public codigo: string,
    public title: string,
    public quantity: number,
    public min_quatity: number,
    public purchasePrice: number,
    public price: number,
    public supplier: Supplier
  ) { }
}

export class ProductResponse {
  constructor(
    public data: Product[],
    public currentPage: number,
    public perPage: string,
    public totalItems: number,
    public totalPages: number | null
  ) { }
}
