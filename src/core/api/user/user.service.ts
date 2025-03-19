import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { Observable } from "rxjs";
import { User } from "../../models/user.model";

@Injectable({
  providedIn: 'root'
})

export class UserService extends BaseService{
    getAllUsers(): Observable<User[]> {
      return this.http.get<User[]>(`${this.API}/customers`, { headers: this.composeHeaders() });
    }
    createUser(data: any) {
      return this.http.post(`${this.API}/customers`, data, { headers: this.composeHeaders() });
    }
    getUserById(id: any): Observable<any> {
      return this.http.get<User[]>(`${this.API}/customers/getById/${id}`, { headers: this.composeHeaders() });
    }
    updatePassword(data: any): Observable<any> {
      return this.http.put(`${this.API}/customers/update-password`, data, { headers: this.composeHeaders() });
    }
    checkUsernameExists(name: string) {
      return this.http.get<boolean>(`${this.API}/customers/check-username/${name}`, { headers: this.composeHeaders() });
    }
    deleteUser(id: string) {
      return this.http.delete(`${this.API}/customers/delete-user/${id}`, { headers: this.composeHeaders() });
    }

}
