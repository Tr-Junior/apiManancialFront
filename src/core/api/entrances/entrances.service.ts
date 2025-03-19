import { Observable } from "rxjs";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";
import { Entrances } from "../../models/entrances.model";

@Injectable({
  providedIn: 'root'
})
export class EntrancesService extends BaseService {
   getEntrances(): Observable<any> {
    return this.http.get<Entrances[]>(`${this.API}/entrance`, { headers: this.composeHeaders() });
  }
  getEntrancesById(id: any): Observable<any> {
    return this.http.get(`${this.API}/entrance/getById/` + id, { headers: this.composeHeaders() });
  }
  delEntrances(id: any): Observable<any> {
    return this.http.delete(`${this.API}/entrance/` + id, { headers: this.composeHeaders() });
  }
  delEntrancesByCode(code: any): Observable<any> {
    return this.http.delete(`${this.API}/entrance/deleteByCode/` + code, { headers: this.composeHeaders() });
  }
}
