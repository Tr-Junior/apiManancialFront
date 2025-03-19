import { Observable } from "rxjs";
import { Supplier } from "../../models/supplier-model";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class SupplierService extends BaseService {
  createSupplier(data: any) {
    return this.http.post(`${this.API}/supplier`, data, { headers: this.composeHeaders() });
  }
  getSupplier(): Observable<any> {
    return this.http.get<Supplier[]>(`${this.API}/supplier`, { headers: this.composeHeaders() });
  }
  updateSupplier(data: any): Observable<any> {
    return this.http.put(`${this.API}/supplier/updateBody`, data, { headers: this.composeHeaders() });
  }
  delSupplier(id: any): Observable<any> {
    return this.http.delete(`${this.API}/supplier/` + id, { headers: this.composeHeaders() });
  }

}
