import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeNGConfig, MessageService, ConfirmationService } from 'primeng/api';
import { Exits } from '../../../../core/models/exits.model';
import { ImportsService } from '../../../../core/services/imports.service';
import { Security } from '../../../../utils/Security.util';
import { ExitsService } from '../../../../core/api/exits/exits.service';

@Component({
  selector: 'app-exits-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers],
  templateUrl: './exits-page.component.html',
  styleUrl: './exits-page.component.css'
})
export class ExitsPageComponent {
  public form: FormGroup;
  public busy = false;
  public pt: any;
  public exits: Exits[] = [];
  public exitId: any;
  public name: any;
  public ptBR: any;
  public currentMonthExits: Exits[] = [];
  public filteredExits: Exits[] = [];
  public startDate: any;
  public endDate: any;
  public searchQuery: string = '';
  public clonedProducts: { [s: string]: Exits } = {};
  public selectedExits!: Exits;
  public updating: boolean = false;
  public formPaymentOptions: { label: string, value: string }[];
  public paymentSums: { [paymentMethod: string]: number } = {};
  public paymentsMap?: any;
  public paymentTotals: PaymentTotal[] = [];
  public rangeDates?: Date[];

  constructor(
    private primengConfig: PrimeNGConfig,
    private exitsService: ExitsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {

    this.form = this.fb.group({
      description: ['', Validators.compose([
        Validators.required
      ])],
      value: ['', Validators.compose([
        Validators.required
      ])],
      formPaymentExit: ['', Validators.compose([
        Validators.required
      ])],
      date: ['', Validators.compose([
        Validators.required
      ])]
    });
    this.formPaymentOptions = this.getFormPaymentExit().map(option => ({ label: option, value: option }));

  }

  ngOnInit() {
    Security.clearPass();
    this.listExits();
    this.calculatePaymentTotals();
  };

  getFormPaymentExit(): string[] {
    return ['Dinheiro', 'Pix', 'Débito'];
  }

  resetForm() {
    this.form.reset();
  }

  submit() {
    this.busy = true;
    this.exitsService.createExits(this.form.value).subscribe({
      next: (data: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Saída cadastrada' });
        this.listExits();
        this.resetForm();
      },
      error: (err: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  searchDate() {
    if (this.rangeDates && this.rangeDates.length > 0) {
      const startDate = this.rangeDates[0];
      const endDate = this.rangeDates.length > 1 ? this.rangeDates[1] : startDate;
      this.getExitsByDateRange(startDate, endDate);
    } else {
      this.listExits();
    }
  }

  getExitsByDateRange(startDate: Date, endDate: Date) {
    this.busy = true;
    this.exitsService.getExits().subscribe(
      (data: any) => {
        const selectedDate = new Date(startDate);
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1); // Adiciona um dia ao endDate

        this.exits = data.filter((exits: Exits) => {
          const exitsDate = new Date(exits.date);
          return exitsDate >= selectedDate && exitsDate < nextDay;
        });

        this.calculatePaymentTotals();

        this.busy = false;
      },
      (err: any) => {
        console.log(err);
        this.busy = false;
      }
    );
  }


  listExits() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    this.exitsService.getExits().subscribe((data: any) => {
      this.busy = false;
      this.exits = data.filter((exit: Exits) => {
        const exitDate = new Date(exit.date);
        return exitDate.getFullYear() === currentYear && exitDate.getMonth() === currentMonth;
      });

      this.calculatePaymentTotals();
    });
  }



  calculatePaymentTotals() {
    this.paymentsMap = new Map<string, { total: number; color: string }>();
    let totalSum = 0;

    for (const exits of this.exits) {
      const payment = exits.formPaymentExit;
      const total = exits.value; // Use o valor da saída para o cálculo

      totalSum += total;

      if (this.paymentsMap.has(payment)) {
        this.paymentsMap.set(payment, {
          total: this.paymentsMap.get(payment).total + total,
          color: this.paymentsMap.get(payment).color
        });
      } else {
        let color;
        switch (payment) {
          case 'Dinheiro':
            color = 'payment-cash';
            break;
          case 'Crédito':
            color = 'payment-credit';
            break;
          case 'Débito':
            color = 'payment-debit';
            break;
          case 'Pix':
            color = 'payment-pix';
            break;
          default:
            case 'Total':
            color = 'payment-total';
            break;
        }
        this.paymentsMap.set(payment, { total, color });
      }
    }

    this.paymentTotals = Array.from(this.paymentsMap, ([formPayment, { total, color }]) => ({
      formPayment,
      total,
      color
    }));

    this.paymentTotals.push({ formPayment: 'Total', total: totalSum, color: '' });
  }



  getExitsById(id: any) {
    this
      .exitsService
      .getExitsById(id)
      .subscribe(
        (data: any) => {
          this.busy = false;
          this.exitId = data._id
          this.form.patchValue(data);
          console.log(data._id);
        }
      );

  }

  onRowEditInit(exits: Exits) {
    if (exits) {
      {
        this.selectedExits = { ...exits };
        this.form.controls['title'].setValue(exits.description);
        this.form.controls['pagamento'].setValue(exits.value);
        this.form.controls['data'].setValue(exits.date)
      };
    }
  }


  onRowEditSave(exits: Exits) {
    this.updating = false;
    const index = this.exits.findIndex(p => p._id === exits._id);
    const updatedExits = { id: exits._id, ...this.selectedExits };
    this.exitsService.updateExits(updatedExits).subscribe({
      next: (data: any) => {
        this.exits[index] = data.exits;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Saída atualizada' });
        this.listExits();
        this.updating = true;
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  onRowEditCancel(exits: Exits) {
    const index = this.exits.findIndex(p => p._id === exits._id);
    this.exits[index] = this.selectedExits;
    this.selectedExits;
    this.listExits();
  }

  confirmDelete(exits: Exits) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir o produto: ${exits.description}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
    acceptLabel: 'Confirmar',
      accept: () => {
        this.delete(exits._id);
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Ação cancelada' });
      }
    });
  }

  delete(id: any) {
    this.exitsService.delExits(id).subscribe({
      next: (data: any) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Saída deletada' });
        this.listExits();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  search() {
    if (this.name == "") {
      this.ngOnInit();
    } else {
      this.exits = this.exits.filter(res => {
        return res.description.toLocaleLowerCase().match(this.name.toLocaleLowerCase());
      })
    }
  }


  clearSearch() {
    this.rangeDates = [];
    this.listExits();
  }
}
interface PaymentTotal {
  formPayment: string;
  total: number;
  color: string;
}
