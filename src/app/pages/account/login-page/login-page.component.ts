import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Security } from '../../../../utils/Security.util';
import { AuthenticateService } from '../../../../core/api/authenticate/authenticate.service';
import { MessageService } from 'primeng/api';
import { ImportsService } from '../../../../core/services/imports.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  public form: FormGroup;
  public busy = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authenticateService: AuthenticateService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const token = Security.getToken();
    if (token) {
      this.busy = true;
      this.authenticateService.refreshToken().subscribe(
        (data: any) => {
          this.busy = false;
          this.setUser(data.user, data.token);
        },
        (err) => {
          localStorage.clear();
          this.busy = false;
        }
      );
    }
  }

  submit() {
    if (this.form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos' });
      return;
    }

    this.busy = true;
    this.authenticateService.authenticate(this.form.value).subscribe(
      (data: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Login efetuado com sucesso!' });
        this.setUser(data.user, data.token);
      },
      (err) => {
        this.busy = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Usuário ou senha inválidos!' });
      }
    );
  }


  setUser(user: any, token: any) {
    Security.setSessionId(user._id);
    Security.set(user, token);

    // Se o usuário for um admin inicial, redireciona para a página de primeiro login
    if (user.firstLogin) {
      this.router.navigate(['/first-login']);
    } else {
      this.router.navigate(['/store']);
    }
  }

}
