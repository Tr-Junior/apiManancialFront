import { Component } from '@angular/core';
import { Budget } from '../../../../core/models/budget.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BoxService } from '../../../../core/services/box.Service';
import { ImportsService } from '../../../../core/services/imports.service';
import { PdfService } from '../../../../common/printPdf.service';
import { BudgetService } from '../../../../core/api/budget/budget.service';
import { ProductService } from '../../../../core/api/products/product.service';

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers],
  templateUrl: './budget-page.component.html',
  styleUrl: './budget-page.component.css'
})
export class BudgetPageComponent {
  public boxItems: any[] = [];
  public products: any[] = [];
  public subtotal: number = 0;
  public grandTotal: number = 0;
  public generalDiscount: number = 0;
  public busy = false;
  public budgets: Budget[] = [];
  public customerName: string = '';
  public clonedBudgets: { [s: string]: Budget } = {};
  searchValue: string | undefined;

  quantityDialogVisible: boolean = false;
  selectedBudget: Budget | null = null;
  selectedItem: any = null;
  quantityToRemove: number = 1;
  originalBudgets: Budget[] = [];

  constructor(
    private messageService: MessageService,
    private budgetService: BudgetService,
    private confirmationService: ConfirmationService,
    private boxService: BoxService,
    private productService: ProductService,
    private pdfService: PdfService
  ) {}

  async ngOnInit() {
    await this.loadBox();
    this.listBudget();
  }

  async loadBox() {
    this.boxItems = await this.boxService.getItems();
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = this.boxItems.reduce((total, item) => total + item.price * item.quantity, 0);
    this.grandTotal = this.subtotal - this.generalDiscount;
  }

  filterBudgets() {
    if (!this.searchValue) {
      this.listBudget(); // Recarrega a lista original
      return;
    }

    const searchTerm = this.searchValue.toLowerCase();
    this.budgets = this.budgets.filter(budget => budget.client.toLowerCase().includes(searchTerm));
  }



  listBudget() {
    this.busy = true;
    this.budgetService.getBudget().subscribe({
      next: (data: Budget[]) => {
        this.busy = false;
        this.budgets = data;
        this.originalBudgets = [...data]; // Guarda uma cópia original
      },
      error: (err: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }


  onRowEditInit(budget: Budget) {
    this.clonedBudgets[budget.number] = { ...budget };
  }

  onRowEditSave(budget: Budget) {
    if (budget.client.trim()) {
      this.budgetService.updateClientName({ id: budget._id, client: budget.client }).subscribe({
        next: () => {
          delete this.clonedBudgets[budget.number];
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nome do cliente atualizado com sucesso' });
        },
        error: (err: any) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'O nome do cliente é obrigatório.' });
    }
  }

  onRowEditCancel(budget: Budget, index: number) {
    this.budgets[index] = this.clonedBudgets[budget.number];
    delete this.clonedBudgets[budget.number];
  }

  openQuantityModal(budget: Budget, item: any) {
    this.selectedBudget = budget;
    this.selectedItem = item;
    this.quantityToRemove = 1;
    this.quantityDialogVisible = true;
  }

  confirmQuantity() {
    if (this.selectedBudget && this.selectedItem) {
      this.removeItemFromBudget(this.selectedBudget, this.selectedItem._id, this.quantityToRemove);
      this.quantityDialogVisible = false;
    }
  }

  removeItemFromBudget(budget: Budget, itemId: string, quantityToRemove: number) {
    this.budgetService.removeItemFromBudget(budget._id, itemId, quantityToRemove).subscribe({
      next: () => {
        const item = budget.budget.items.find(item => item._id === itemId);
        if (item && item.quantity > quantityToRemove) {
          item.quantity -= quantityToRemove;
        } else {
          budget.budget.items = budget.budget.items.filter(item => item._id !== itemId);
        }
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Quantidade removida com sucesso!' });
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  calculateTotalO(items: any[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

 confirmDelete(budget: Budget) {
  if (!budget) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Orçamento inválido para exclusão' });
    return;
  }

  this.confirmationService.confirm({
    message: `Deseja realmente excluir o orçamento de ${budget.client}?`,
    header: 'Atenção',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Confirmar',

    accept: () => {
      const index = this.budgets.indexOf(budget);
      if (index !== -1) {
        this.removeBudget(index);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Orçamento não encontrado' });
      }
    },
    reject: () => {
      this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'A exclusão foi cancelada' });
    }
  });
}

  removeBudget(index: number) {
    if (index < 0 || index >= this.budgets.length) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Índice inválido para exclusão' });
      return;
    }

    const budget = this.budgets[index];
    if (!budget || !budget._id) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Orçamento inválido para exclusão' });
      return;
    }

    this.budgetService.delBudget(budget._id).subscribe({
      next: () => {
        this.budgets.splice(index, 1);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento removido com sucesso' });
      },
      error: (err: any) => {
        console.error('Erro ao excluir orçamento:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }


  async addBudgetToBox(budget: any) {
    const items = budget.budget.items;

    for (const item of items) {
      try {
        const productDetails = await this.productService.getProductById(item.product).toPromise();

        if (!productDetails) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Produto não encontrado!' });
          return;
        }

        const boxItem = {
          _id: productDetails._id,
          title: productDetails.title,
          price: productDetails.price,
          purchasePrice: productDetails.purchasePrice,
          quantity: item.quantity,
          discount: 0
        };

        await this.boxService.addItem(boxItem);
      } catch (error) {
        console.error('Erro ao adicionar item à caixa:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar item à caixa' });
        return;
      }
    }

    try {
      this.removeBudget(this.budgets.indexOf(budget));
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento adicionado à caixa!' });
      await this.loadBox();
      await this.listBudget();
    } catch (error) {
      console.error('Erro ao finalizar a adição do orçamento:', error);
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao processar o orçamento' });
    }
  }

  generatePDF(budget: Budget): void {
    if (!budget || !budget.budget || budget.budget.items.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nenhum item no orçamento para salvar como PDF.',
      });
      return;
    }

    this.pdfService.saveBudgetAsPdf(budget);
    this.messageService.add({
      severity: 'success',
      summary: 'PDF Gerado',
      detail: 'O orçamento foi salvo como PDF.',
    });
  }

}
