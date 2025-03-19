import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Security } from '../../utils/Security.util';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = Security.getToken();
    if (!token) {
      this.router.navigate(['/login-guard']);
      return false;
    }

    // Verifica se o usuário já autenticou via Login Guard
    const authGuardPass = sessionStorage.getItem('auth-guard');
    if (authGuardPass === 'true') {
      return true;
    }

    // Armazena a rota que o usuário tentou acessar antes de ser redirecionado
    sessionStorage.setItem('redirectAfterLoginGuard', state.url);

    // Redireciona para a tela de login guard
    this.router.navigate(['/login-guard']);
    return false;
  }
}
