import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticateService } from '../../../../core/api/authenticate/authenticate.service';
import { ImportsService } from '../../../../core/services/imports.service';
import { Security } from '../../../../utils/Security.util';

@Component({
  selector: 'app-first-login-page',
  standalone: true,
   imports: [ImportsService.imports],
    providers: [ImportsService.providers],
  templateUrl: './first-login-page.component.html',
  styleUrl: './first-login-page.component.css'
})
export class FirstLoginPageComponent {
  public form: FormGroup;
  public busy = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private authenticateService: AuthenticateService
  ) {
    this.form = this.fb.group({
      newName: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos corretamente' });
      return;
    }

    this.busy = true;
    const { newName, newPassword } = this.form.value;

    this.authenticateService.updateAdminCredentials(newName, newPassword).subscribe(
      (data: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Credenciais atualizadas com sucesso!' });
        this.router.navigate(['/login']);
        Security.clear();
      },
      (err) => {
        this.busy = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar credenciais' });
      }
    );
  }
}
