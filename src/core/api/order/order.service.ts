import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../models/order.models';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseService {
  createOrder(data: any) {
    return this.http.post(`${this.API}/orders`, data, { headers: this.composeHeaders() });
  }

  getOrder(): Observable<any> {
    return this.http.get<Order[]>(`${this.API}/orders/sales`, { headers: this.composeHeaders() });
  }

  getOrderByDateRange(startDate?: Date, endDate?: Date): Observable<Order[]> {
    const url = `${this.API}/orders/sales`;
    const body = {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined
    };

    return this.http.post<Order[]>(url, body, { headers: this.composeHeaders() });
  }

  getOrderById(id: any): Observable<any> {
    return this.http.get(`${this.API}/orders/getById/` + id, { headers: this.composeHeaders() });
  }
  delOrder(id: any): Observable<any> {
    return this.http.delete(`${this.API}/orders/` + id, { headers: this.composeHeaders() });
  }
  delOrderByCode(code: any): Observable<any> {
    return this.http.delete(`${this.API}/orders/deleteByCode/` + code, { headers: this.composeHeaders() });
  }
}
