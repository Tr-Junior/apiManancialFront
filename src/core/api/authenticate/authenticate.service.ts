import { Observable } from "rxjs/internal/Observable";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class AuthenticateService extends BaseService {
   authenticate(data: any) {
     return this.http.post(`${this.API}/customers/authenticate`, data);
   }

   updateAdminCredentials(newName: string, newPassword: string) {
    return this.http.post(`${this.API}/customers/update-admin`, { newName, newPassword },{ headers: this.composeHeaders() });
  }


   refreshToken() {
     return this.http.post(`${this.API}/customers/refresh-token`, null, { headers: this.composeHeaders() } );
   }

   validatePassword(data: any): Observable<{ valid: boolean }> {
     return this.http.post<{ valid: boolean }>(`${this.API}/customers/validate-password`, data, { headers: this.composeHeaders() });
   }

}
