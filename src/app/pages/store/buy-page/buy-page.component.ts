import { Component } from '@angular/core';
import { ImportsService } from '../../../../core/services/imports.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductsBuy } from '../../../../core/models/productsBuy-model';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductBuyService } from '../../../../core/api/productBuy/productBuy.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-buy-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers],
  templateUrl: './buy-page.component.html',
  styleUrl: './buy-page.component.css'
})
export class BuyPageComponent {
  public productsBuy: ProductsBuy[] = [];
  public busy = false;
  public form: FormGroup;
  selectedProducts: any[] = [];
  metaKeySelection: boolean = false;
  public searchQuery: string = '';
  public filteredProducts: ProductsBuy[] = []; // Produtos filtrados pela pesquisa

  constructor(
    private productBuyService: ProductBuyService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.compose([
        Validators.required
      ])],
    });
  }

  onRowEditInit(product: any) {
    this.messageService.add({ severity: 'info', summary: 'Edição de tabela iniciada', detail: product.title });
  }

  onRowEditSave(product: any) {
    console.log('Produto antes do envio:', product);

    const updatedProduct = {
      id: product._id,
      title: product.title
    };

    this.productBuyService.updateProductBuy(updatedProduct).subscribe(
      () => {
        this.loadProducts();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado com sucesso.' });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar produto.' });
        console.error('Erro de atualização:', error);
      }
    );
  }

  onRowEditCancel(product: any, index: number) {
    this.messageService.add({ severity: 'warn', summary: 'Edição cancelada', detail: product.title });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.busy = true;
    this.productBuyService.getProductBuy().subscribe(
      (data: ProductsBuy[]) => {
        this.productsBuy = data.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
        this.filteredProducts = [...this.productsBuy]; // Inicialmente, todos os produtos são exibidos
        this.busy = false;
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos.' });
        this.busy = false;
      }
    );
  }

  // Método para filtrar os produtos com base na pesquisa
  filterProducts() {
    const query = this.searchQuery.toLowerCase();
    this.filteredProducts = this.productsBuy.filter(product => product.title.toLowerCase().includes(query));
  }

  submitForm() {
    if (this.form.valid) {
      this.submit();
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.busy = true;

      // Removido o campo "status"
      const formValue = {
        ...this.form.value
      };

      this.productBuyService.createProductBuy(formValue).subscribe({
        next: (data: any) => {
          this.busy = false;
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: data.message });
          this.resetForm();
          this.loadProducts();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.busy = false;
          if (err.status === 400 && err.error.message) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error.message });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar o produto.' });
          }
        }
      });
    }
  }

  resetForm() {
    this.form.reset();
  }

  onEdit(event: any, product: ProductsBuy) {
    console.log('Produto antes do envio:', product);

    const updatedProduct = {
      id: product._id
    };

    this.productBuyService.updateProductBuy(updatedProduct).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado com sucesso.' });
        this.loadProducts();
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar produto.' });
        console.error('Erro de atualização:', error);
      }
    );
  }

  deleteProduct(id: any) {
    this.productBuyService.delProductBuy(id).subscribe(
      (data: any) => {
        this.busy = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: data.message });
        this.loadProducts();
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar produto.' });
      }
    );
  }

  deselectAll(): void {
    this.selectedProducts = [];
  }

  confirmDeleteSelected() {
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Nenhum produto selecionado!' });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir os ${this.selectedProducts.length} produtos selecionados?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteSelectedProducts(), // Chama a função de exclusão ao confirmar
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'A exclusão foi cancelada' });
      }
    });
  }

  deleteSelectedProducts() {
    if (this.selectedProducts && this.selectedProducts.length) {
      this.selectedProducts.forEach(product => {
        this.productBuyService.delProductBuy(product._id).subscribe(
          () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Produto ${product.title} excluído com sucesso.` });
            this.loadProducts();
          },
          (error: HttpErrorResponse) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Erro ao excluir produto: ${product.title}` });
            console.error('Erro:', error);
          }
        );
      });
      this.selectedProducts = []; // Limpa a seleção após a exclusão
    }
  }
  clearSearch() {
    this.searchQuery = '';
    this.loadProducts();
  }

  generatePDF() {
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Nenhum produto selecionado!' });
      return;
    }

    const doc = new jsPDF();

    // Adiciona título
    doc.setFontSize(16);
    doc.text('Lista de Produtos para compra', 14, 15);

    // Formata os dados para a tabela
    const tableData = this.selectedProducts.map((product, index) => [
      index + 1,
      product.title
    ]);

    // Corrigido: Chamada correta da função autoTable
    autoTable(doc, {
      startY: 25,
      head: [['#', 'Nome do Produto']],
      body: tableData
    });

    // Salva o PDF
    doc.save('produtos-selecionados.pdf');

    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'PDF gerado com sucesso!' });
  }
}
