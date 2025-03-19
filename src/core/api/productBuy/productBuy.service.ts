import { Observable } from "rxjs";
import { ProductsBuy } from "../../models/productsBuy-model";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class ProductBuyService extends BaseService {
  createProductBuy(data: any) {
    return this.http.post(`${this.API}/productBuy`, data, { headers: this.composeHeaders() });
  }
  getProductBuy(): Observable<any> {
    return this.http.get<ProductsBuy[]>(`${this.API}/productBuy`, { headers: this.composeHeaders() });
  }
  updateProductBuy(data: any): Observable<any> {
    return this.http.put(`${this.API}/productBuy/update`, data, { headers: this.composeHeaders() });
  }
  delProductBuy(id: any): Observable<any> {
    return this.http.delete(`${this.API}/productBuy/` + id, { headers: this.composeHeaders() });
  }

  searchProductBuy(data: any): Observable<ProductsBuy[]> {
    return this.http.post<ProductsBuy[]>(`${this.API}/productBuy/search`, data, { headers: this.composeHeaders() });
  }
}
