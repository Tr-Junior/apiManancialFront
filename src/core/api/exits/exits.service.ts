import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Exits } from '../../models/exits.model';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root',
})
export class ExitsService extends BaseService {

  createExits(data: any) {
    return this.http.post(`${this.API}/exits`, data, { headers: this.composeHeaders() });
  }
  searchExits(description: string): Observable<Exits[]> {
    return this.http.get<Exits[]>(`${this.API}/exits/search/` + description, { headers: this.composeHeaders() });
  }
  getExits(): Observable<any> {
    return this.http.get<Exits[]>(`${this.API}/exits`, { headers: this.composeHeaders() });
  }
  getExitsById(id: any): Observable<any> {
    return this.http.get(`${this.API}/exits/getById/` + id, { headers: this.composeHeaders() });
  }
  updateExits(data: any): Observable<any> {
    return this.http.put(`${this.API}/exits/update`, data, { headers: this.composeHeaders() });
  }
  delExits(id: any): Observable<any> {
    return this.http.delete(`${this.API}/exits/` + id, { headers: this.composeHeaders() });
  }
}
