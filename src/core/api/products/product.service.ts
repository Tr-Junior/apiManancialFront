import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductResponse } from '../../models/product.model';
import { BaseService } from '../base.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {

  searchProduct(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/products/search`, data, { headers: this.composeHeaders() });
  }

  getProductById(id: any): Observable<any> {
    return this.http.get(`${this.API}/products/getById/` + id, { headers: this.composeHeaders() });
  }
  getProducts(params: any) {
    return this.http.get<ProductResponse>(`${this.API}/products`, {
      headers: this.composeHeaders(),
      params: new HttpParams({ fromObject: params })
    });
  }

  createProduct(data: any) {
    return this.http.post(`${this.API}/products`, data, { headers: this.composeHeaders() });
  }

  updateProduct(data: any): Observable<any> {
    return this.http.put(`${this.API}/products/updateBody`, data, { headers: this.composeHeaders() });
  }
  deleteProduct(id: any): Observable<any> {
    return this.http.delete(`${this.API}/products/` + id, { headers: this.composeHeaders() })
  }
}
