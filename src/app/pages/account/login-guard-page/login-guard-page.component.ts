import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Security } from '../../../../utils/Security.util';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ImportsService } from '../../../../core/services/imports.service';
import { AuthenticateService } from '../../../../core/api/authenticate/authenticate.service';

@Component({
  selector: 'app-login-guard-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers, MessageService],
  templateUrl: './login-guard-page.component.html',
  styleUrl: './login-guard-page.component.css'
})
export class LoginGuardPageComponent implements OnDestroy {
  password: string = '';
  userId: string = '';

  constructor(
    private router: Router,
    private authenticateService: AuthenticateService,
    private messageService: MessageService // Injetando o MessageService
  ) {}

  ngOnInit() {
    // Obtém o ID do usuário do token armazenado
    const user = Security.getUser();
    if (user) {
      this.userId = user._id;
    } else {
      this.router.navigate(['/login']);
    }
  }

  login() {
    if (!this.password) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Digite sua senha!' });
      return;
    }

    const requestData = {
      userId: this.userId,
      password: this.password
    };

    this.authenticateService.validatePassword(requestData).subscribe(
      response => {
        if (response.valid) {
          sessionStorage.setItem('auth-guard', 'true');

          // Recupera a rota original que o usuário tentou acessar
          const redirectUrl = sessionStorage.getItem('redirectAfterLoginGuard') || '/sales';
          sessionStorage.removeItem('redirectAfterLoginGuard'); // Remove para evitar redirecionamento indevido

          this.router.navigate([redirectUrl]);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Senha incorreta!' });
        }
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Senha invalida!' });
      }
    );
  }

  ngOnDestroy() {
    // Limpa a chave 'auth-guard' quando o componente for destruído
    sessionStorage.removeItem('auth-guard');
  }
}
