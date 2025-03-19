import { Component } from '@angular/core';
import { ImportsService } from '../../../core/services/imports.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICompany } from '../../../core/models/company.model';
import { Observable } from 'rxjs';
import { UploadPageComponent } from '../upload-page/upload-page.component';
import { CompanyService } from '../../../core/api/company/company.service';

@Component({
  selector: 'app-company-info-page',
  standalone: true,
  imports: [ImportsService.imports, UploadPageComponent],
  providers: [ImportsService.providers, MessageService],
  templateUrl: './company-info-page.component.html',
  styleUrls: ['./company-info-page.component.css']
})
export class CompanyInfoPageComponent {
  public company: ICompany [] = [];
  public isLoading: boolean = true;
  public form: FormGroup;
  public busy = false;

  constructor(
    private companyService: CompanyService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.fb.group({
      id: [{ value: '', disabled: true }],
      name: [''],
      cnpj: [''],
      email: [''],
      telephone: [''],
      addressLine: [''],
      addressLine2: [''],
      backYard: [''],
      city: [''],
      neighborhood: [''],
      state: [''],
      zip: ['']
    });
  }

  ngOnInit(): void {
    this.listCompany();
  }

  listCompany() {
    this.busy = true;
    this.companyService.getCompany().subscribe({
      next: (data: ICompany[]) => {
        this.busy = false;
        this.company = data;
        if (this.company.length > 0) {
          const id = this.company[0]._id; // Garante que o array não está vazio
          this.listCompanyById(id);
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Nenhuma empresa encontrada.' });
        }
      },
      error: (err: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  listCompanyById(id: string) {
    if (!id) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'ID da empresa não fornecido' });
      return;
    }

    this.busy = true;

    this.companyService.getCompanyId(id).subscribe({
      next: (data: ICompany) => {
        this.busy = false;

        this.form.patchValue({
          id: data._id,
          name: data.name,
          cnpj: data.cnpj,
          email: data.contact.email,
          telephone: data.contact.telephone,
          addressLine: data.address.addressLine,
          addressLine2: data.address.addressLine2,
          backYard: data.address.backYard,
          city: data.address.city,
          neighborhood: data.address.neighborhood,
          state: data.address.state,
          zip: data.address.zip
        });
        localStorage.setItem('companyData', JSON.stringify(data));
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa carregada com sucesso' });
      },
      error: (err: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar a empresa: ' + err.message });
      }
    });
  }


  onCepBlur() {
    const cep = this.form.get('zip')?.value;
    if (cep) {
      this.companyService.findCep({ cep }).subscribe({
        next: (data: any) => {
          console.log(data);
          this.form.patchValue({
            backYard: data.rua || '',
            city: data.cidade || '',
            neighborhood: data.bairro || '',
            state: data.estado || ''
          });
        },
        error: (err: any) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'CEP não encontrado' });
        }
      });
    }
  }

  saveCompany() {
    const id = this.form.get('id')?.value?.trim(); // Garantir que o ID não tenha espaços extras
    const payload: ICompany = {
      _id: id || '', // Pode ser vazio para criação
      name: this.form.get('name')?.value,
      cnpj: this.form.get('cnpj')?.value,
      contact: {
        email: this.form.get('email')?.value,
        telephone: this.form.get('telephone')?.value,
      },
      address: {
        zip: this.form.get('zip')?.value,
        backYard: this.form.get('backYard')?.value,
        neighborhood: this.form.get('neighborhood')?.value,
        addressLine: this.form.get('addressLine')?.value,
        addressLine2: this.form.get('addressLine2')?.value,
        city: this.form.get('city')?.value,
        state: this.form.get('state')?.value,
      },
    };

    if (this.form.valid) {
      if (id) {
        // Atualizar empresa existente
        this.companyService.updateCompany(id, payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Informações da empresa atualizadas com sucesso',
            });
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar as informações da empresa: ' + err.message,
            });
          },
        });
      } else {
        // Criar nova empresa
        this.companyService.createCompany(payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Empresa criada com sucesso',
            });
            this.listCompany();
            this.form.reset(); // Limpa o formulário após criação
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar a empresa: ' + err.message,
            });
          },
        });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Formulário inválido. Preencha os campos obrigatórios.',
      });
    }
  }


}
