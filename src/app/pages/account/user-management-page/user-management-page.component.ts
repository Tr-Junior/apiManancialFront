import { Component } from '@angular/core';
import { ImportsService } from '../../../../core/services/imports.service';
import { UserService } from '../../../../core/api/user/user.service';
import { User } from '../../../../core/models/user.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [ImportsService.imports],
    providers: [ImportsService.providers],
  templateUrl: './user-management-page.component.html',
  styleUrl: './user-management-page.component.css'
})
export class UserManagementPageComponent {

  public user: User[] = [];

constructor(
  private confirmationService: ConfirmationService,
   private messageService: MessageService,
  private userService: UserService,
){
}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(){
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.user = data;
        console.log(this.user);
      },
      error: (error) => {
        console.error('Error fetching users', error);
      }
    })
  }

  confirmDelete(user: User){
    if (!user) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Usuário inválido para exclusão' });
      return;
    }

    this.confirmationService.confirm({
      message: `Deseja realmente excluir o Usuário ${user.name}?`,
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const index = this.user.indexOf(user);
        if (index !== -1) {
          this.deleteUser(index);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Usuário não encontrado' });
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'A exclusão foi cancelada' });
      }
    });

  }


  deleteUser(index: number){
    if (index < 0 || index >= this.user.length) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Índice inválido para exclusão' });
      return;
    }

    const user = this.user[index];
    if (!user || !user._id) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Usuário inválido para exclusão' });
      console.log(user._id)
      return;
    }

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.user.splice(index, 1);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário removido com sucesso' });
      },
      error: (err: any) => {
        console.error('Erro ao excluir orçamento:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }
}
