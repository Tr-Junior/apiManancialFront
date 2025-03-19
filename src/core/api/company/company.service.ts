import { Observable } from "rxjs";
import { ICompany } from "../../models/company.model";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class CompanyService extends BaseService {
getCompany(): Observable<any> {
return this.http.get<ICompany[]>(`${this.API}/companyInfo/company`, { headers: this.composeHeaders() });
}

getCompanyId(id: any): Observable<any> {
  return this.http.get(`${this.API}/companyInfo/company/` + id, { headers: this.composeHeaders() });
}

createCompany(data: any): Observable<any> {
  return this.http.post(`${this.API}/companyInfo/company`, data, { headers: this.composeHeaders() });
}

updateCompany(id: any, data: any): Observable<any> {
  return this.http.put(`${this.API}/companyInfo/company/`+ id, data, { headers: this.composeHeaders() });
}

findCep(data: any): Observable<any> {
  return this.http.post(`${this.API}/api/cep`, data, { headers: this.composeHeaders() });
}
  }
