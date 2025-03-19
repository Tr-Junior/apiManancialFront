import { Observable } from "rxjs";
import { Budget } from "../../models/budget.model";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class BudgetService extends BaseService {
    createBudget(data: any) {
       return this.http.post(`${this.API}/budget`, data, { headers: this.composeHeaders() });
     }
     getBudget(): Observable<any> {
       return this.http.get<Budget[]>(`${this.API}/budget`, { headers: this.composeHeaders() });
     }
     getBudgetById(id: any): Observable<any> {
       return this.http.get(`${this.API}/budget/getById/` + id, { headers: this.composeHeaders() });
     }
     delBudget(id: any): Observable<any> {
       return this.http.delete(`${this.API}/budget/` + id, { headers: this.composeHeaders() });
     }
     delBudgetByCode(code: any): Observable<any> {
       return this.http.delete(`${this.API}/budget/deleteByCode/` + code, { headers: this.composeHeaders() });
     }

     updateClientName(data: any) {
       return this.http.put(`${this.API}/budget/update-client-name`, data, { headers: this.composeHeaders() });
     }

     removeItemFromBudget(budgetId: string, itemId: string, quantityToRemove: number) {
       return this.http.put(`${this.API}/budget/remove-item`, { id: budgetId, itemId, quantityToRemove }, { headers: this.composeHeaders() });
     }

    }
