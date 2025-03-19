import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Security } from "../../utils/Security.util";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  constructor(
    private router: Router,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = Security.getToken();
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    if (state.url.startsWith('/features') || state.url.startsWith('/account/new-user')) {
      if (!Security.hasRole('admin')) {
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }
}
