import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ImportsService } from '../../../../core/services/imports.service';
import { BoxItem} from '../../../../core/models/box-item.model';
import { BoxService } from '../../../../core/services/box.Service';
import { Product } from '../../../../core/models/product.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { Budget } from '../../../../core/models/budget.model';
import { User } from '../../../../core/models/user.model';
import { Security } from '../../../../utils/Security.util';
import { PdfService } from '../../../../common/printPdf.service';
import { ProductService } from '../../../../core/api/products/product.service';
import { OrderService } from '../../../../core/api/order/order.service';
import { BudgetService } from '../../../../core/api/budget/budget.service';

@Component({
  selector: 'app-box-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers],
  templateUrl: './box-page.component.html',
  styleUrl: './box-page.component.css'
})
export class BoxPageComponent implements OnInit, OnDestroy{
  public boxItems: BoxItem[] = [];
  public subtotal = 0;
  public grandTotal = 0;
  public products: Product[] = [];
  public currentPage = 1;
  public totalPages = 0;
  public searchQuery = '';
  public selectedPayment?: string;
  public generalDiscount = 0;
  public loading = false;
  public searchQueryChanged = new Subject<string>();
  public customerName = '';
  public filteredCustomers: string[] = [];
  public customerNames: string[] = [];
  public budgets: Budget[] = [];
  public items!: MenuItem[];
  public sidebarVisible = false;
  public selectedProduct: Product | null = null;
  public availableStock = 0;
  public user!: User;
  public editedPrice = 0;
  public total = null;
  public totalTroco = 0;
  public totalRecords = 0;
  public checked = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();


  constructor(
    private boxService: BoxService,
    private productService: ProductService,
    private orderService: OrderService,
    private budgetService: BudgetService,
    private messageService: MessageService,
    private pdfService: PdfService

  ) {
  }


  ngOnInit(): void {
    this.user = Security.getUser();

    Promise.all([this.listBudget(), this.loadCustomerNames(), this.loadCart()]);

    this.boxService.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.boxItems = items;
      this.calculateTotals();
    });

    // Adiciona debounce para evitar requisições excessivas
    this.searchSubject.pipe(
      debounceTime(300), // Aguarda 300ms sem digitação antes de pesquisar
      takeUntil(this.destroy$)
    ).subscribe(query => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery.length) {
        this.clearSearch(); // Limpa os produtos quando o campo fica vazio
        return;
      }

      this.search(1, true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getScrollHeight(): string {
    const itemHeight = 70;
    const totalItems = this.products.length;
    const maxHeight = 400;
    const minHeight = 200;

    let calculatedHeight = totalItems * itemHeight;
    if (calculatedHeight < minHeight) {
      calculatedHeight;
    } else if (calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight;
    }
    return `${calculatedHeight}px`;
  }

  onSearchChange(): void {
    // Atualiza o valor da pesquisa e dispara o debounce
    this.searchSubject.next(this.searchQuery);
  }

  search(page: number = 1, reset: boolean = false): void {
    const trimmedQuery = this.searchQuery.trim();
    if (!trimmedQuery) {
      if (reset) this.clearSearch();
      return;
    }

    if (reset) {
      this.products = [];
      this.currentPage = 1;
    }

    this.loading = true;

    this.productService
      .searchProduct({ title: trimmedQuery, page, limit: 25 })
      .pipe(takeUntil(this.destroy$)) // Evita vazamento de memória
      .subscribe({
        next: ({ products, totalRecords }) => {
          this.products = reset ? products : [...this.products, ...products];
          this.totalRecords = totalRecords;
          this.totalPages = Math.ceil(totalRecords / 25);
          this.currentPage = page;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro de pesquisa', err);
        },
      });
  }

  loadDataLazy(event: any): void {
    if (this.loading || this.currentPage >= this.totalPages) {
      return;
    }

    this.loading = true;
    const nextPage = this.currentPage + 1;

    this.productService.searchProduct({ title: this.searchQuery.trim(), page: nextPage, limit: 25 }).subscribe({
      next: (response: any) => {
        this.products.push(...response.products);
        this.totalRecords = response.totalRecords;
        this.totalPages = Math.ceil(response.totalRecords / 25);
        this.currentPage = nextPage;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao Buscar Produtos',
          detail: 'Houve um erro ao tentar buscar os produtos. ' + (err.message || 'Tente novamente mais tarde.')
        });
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = ''; // Limpa o campo de pesquisa
    this.products = []; // Zera a lista de produtos
    this.totalRecords = 0;
    this.currentPage = 1;
  }

  async loadCart() {
    this.boxItems = await this.boxService.getItems();
    this.calculateTotals();
  }

 async addToBox(data: any): Promise<void> {
    const product = this.products.find(p => p._id === data._id);

    if (!product) {
        this.messageService.add({
            severity: 'error',
            summary: 'Produto Não Encontrado',
            detail: 'Produto não encontrado no estoque.'
        });
        return;
    }

    // Obtém a quantidade já reservada nos orçamentos
    const { quantity: reservedQuantity, clients } = this.getQuantityInBudget(product._id);

    // Quantidade disponível real no estoque considerando os orçamentos
    const availableStock = product.quantity - reservedQuantity;

    if (availableStock <= 0) {
        this.messageService.add({
            severity: 'error',
            summary: 'Estoque Indisponível',
            detail: `Todo o estoque de ${product.title} já está reservado para clientes: ${clients.join(', ')}.`
        });
        return;
    }

    const existingItem = this.boxItems.find(item => item._id === product._id);

    if (existingItem) {
        // Se o item já existe, verifica se pode adicionar mais
        if (existingItem.quantity + 1 > availableStock) {
            this.messageService.add({
                severity: 'error',
                summary: 'Quantidade Excedida',
                detail: `Não é possível adicionar mais do que ${availableStock} unidades de ${product.title}.`
            });
            return;
        }

        // Incrementa a quantidade e atualiza no sessionStorage
        existingItem.quantity += 1;
        this.boxService.updateItem(existingItem);
    } else {
        // Adiciona um novo item ao carrinho
        const newItem: BoxItem = {
            _id: product._id,
            title: product.title,
            price: product.price,
            purchasePrice: product.purchasePrice,
            quantity: 1,
            discount: 0
        };

        await this.boxService.addItem(newItem);
    }

    this.messageService.add({
        severity: 'success',
        summary: 'Item Adicionado',
        detail: `${product.title} foi adicionado ao carrinho.`
    });

    // Recarrega os itens do carrinho para garantir atualização
    this.boxItems = this.boxService.getItems();
    await this.loadCart();
    this.calcTroco();
}

  updateQuantity(newQuantity: number, item: BoxItem, isFinalUpdate: boolean = false): void {
    if (newQuantity <= 0) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Quantidade zerada. Verifique os itens antes de continuar.'
        });
        return;
    }

    this.productService.getProductById(item._id).subscribe({
        next: (product) => {
            if (!product) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Produto não encontrado no estoque'
                });
                return;
            }

            // Obtém a quantidade reservada nos orçamentos
            const { quantity: reservedQuantity, clients } = this.getQuantityInBudget(product._id);

            // Estoque disponível considerando os orçamentos
            const availableStock = product.quantity - reservedQuantity;

            if (availableStock <= 0) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Estoque Insuficiente',
                    detail: `Todo o estoque de ${product.title} já está reservado para clientes: ${clients.join(', ')}.`
                });
                return;
            }

            if (newQuantity > availableStock) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Aviso',
                    detail: `Quantidade disponível em estoque considerando orçamentos: ${availableStock}`
                });
                item.quantity = availableStock; // Ajusta para a quantidade máxima disponível
            } else {
                item.quantity = newQuantity; // Atualiza para o valor inserido
            }

            // ✅ Atualiza apenas no sessionStorage silenciosamente
            const items = this.boxService.getItems();
            const updatedItems = items.map(i => i._id === item._id ? { ...i, quantity: item.quantity } : i);
            this.boxService['updateStorageSilent'](updatedItems);

            // ✅ Só emite a atualização quando o usuário finalizar a edição
            if (isFinalUpdate) {
                this.boxService.updateItem(item);
            }

            this.calculateTotals();
            this.calcTroco();
        },
        error: (err) => {
            console.error('Erro ao buscar produto pelo ID:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível verificar o estoque do produto.'
            });
        }
    });
}


  async remove(data: any): Promise<void> {
    await this.boxService.removeItem(data._id);
    await this.loadCart();
  }

 paymentMethods = ['Débito', 'Crédito', 'Pix', 'Dinheiro', 'Outros'];
payments: { method: string, amount: number }[] = [];
selectedPaymentMethod: string = '';
firstPaymentMethod: string = '';
secondPaymentMethod: string = '';
firstPaymentAmount: number = 0;
secondPaymentAmount: number = 0;
isSplitPayment: boolean = false;
loadingBudget: boolean = false; // Controla o botão "Salvar Orçamento"

onPaymentMethodChange() {
  if (this.selectedPaymentMethod !== 'Outros') {
    this.firstPaymentMethod = '';
    this.secondPaymentMethod = '';
    this.firstPaymentAmount = this.grandTotal; // Assume pagamento total na forma única
    this.secondPaymentAmount = 0;
    this.payments = [{ method: this.selectedPaymentMethod, amount: this.firstPaymentAmount }];
  } else {
    this.firstPaymentAmount = 0;
    this.secondPaymentAmount = 0;
    this.payments = [];
  }
}

updatePaymentAmounts() {
  if (this.selectedPaymentMethod !== 'Outros') return;

  // Garante que os valores são números válidos
  this.firstPaymentAmount = this.firstPaymentAmount || 0;
  this.secondPaymentAmount = this.secondPaymentAmount || 0;

  // Define o segundo pagamento como a diferença entre o total e o primeiro valor
  this.secondPaymentAmount = Math.max(this.grandTotal - this.firstPaymentAmount, 0);

  this.addPayment();
}




addPayment() {
  this.payments = []; // Sempre limpa antes de adicionar os pagamentos atualizados

  if (this.selectedPaymentMethod === 'Outros') {
    if (!this.firstPaymentMethod || !this.secondPaymentMethod || this.firstPaymentAmount <= 0 || this.secondPaymentAmount <= 0) {
      return;
    }

    this.payments.push(
      { method: this.firstPaymentMethod, amount: this.firstPaymentAmount },
      { method: this.secondPaymentMethod, amount: this.secondPaymentAmount }
    );
  } else {
    if (!this.selectedPaymentMethod || this.firstPaymentAmount <= 0) {
      return;
    }

    this.payments.push({ method: this.selectedPaymentMethod, amount: this.firstPaymentAmount });
  }

}



calcTroco() {
  const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceived = this.total || totalPaid;
  this.totalTroco = Math.max(0, totalReceived - this.grandTotal);
}

updateGeneralDiscount(discount: number): void {
  this.generalDiscount = discount;
  this.calculateTotals();
}

calculateTotals(): void {
  this.subtotal = this.boxItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.grandTotal = this.subtotal * (1 - this.generalDiscount / 100);

  // Atualiza os valores dos pagamentos sempre que o total mudar
  if (this.selectedPaymentMethod === 'Outros') {
    this.updatePaymentAmounts();
  }

  this.calcTroco();
}


submitOrder(): void {
  const validItems = this.boxItems.filter(item => item.quantity > 0);
  if (validItems.length === 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Adicione itens válidos ao caixa antes de finalizar a venda.'
    });
    return;
  }

  if (this.payments.length === 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Selecione pelo menos uma forma de pagamento antes de finalizar a venda.'
    });
    return;
  }
 this.loading = true;
  const order = this.createOrderObject(validItems);


  setTimeout(() => {
    this.orderService.createOrder(order).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Venda Finalizada',
          detail: 'Pedido realizado com sucesso!'
        });
        this.clearBox();
        this.payments = []; // Reseta os pagamentos APÓS a venda
        this.clearSearch();
        this.isSplitPayment = false;
      },
      error: err => {
        console.error('Erro na requisição:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao finalizar a venda: ' + (err.message || 'Erro desconhecido.')
        });
      }
    });
    this.loading = false;
  }, 1000);
}

private createOrderObject(validItems: any[]): any {
  return {
    customer: this.user._id,
    sale: {
      items: validItems.map(item => ({
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        title: item.title,
        product: item._id
      })),
      discount: this.generalDiscount,
      total: this.grandTotal
    },
    payments: this.payments
  };
}


listBudget() {
  this.budgetService.getBudget().subscribe({
   next: (data: Budget[]) => {
      this.budgets = data;
    },
    error: (error) => console.error(error)
  });
}

filterCustomer(event: any) {
  const query = event.query.toLowerCase();
  this.filteredCustomers = this.customerNames.filter(customer => customer.toLowerCase().includes(query));
}

loadCustomerNames() {
  this.budgetService.getBudget().subscribe({
    next: (data: Budget[]) => {
      this.customerNames = data.map(budget => budget.client);
    },
    error: (err: any) => {
      console.log(err);
      //this.toastr.error(err.message);
    }
  });
}


async createBudget() {
  this.loadingBudget = true;
  try {
    const cartItems = await this.boxService.getItems(); // Recupera os itens do caixa

    if (cartItems.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'O carrinho está vazio' });
      return;
    }

    if (!this.customerName || this.customerName.trim() === '') {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Nome do cliente não pode estar vazio' });
      return;
    }

    const budget = {
      client: this.customerName,
      budget: {
        items: cartItems.map(item => ({
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          product: item._id
        })),
        total: cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
      }
    };

    // Envia o orçamento ao backend
    const data: any = await this.budgetService.createBudget(budget).toPromise();
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: data.message });

    this.clearBox();
    this.customerName = '';
    this.grandTotal = 0;
    this.subtotal = 0;
    this.totalTroco = 0;
    this.listBudget();
    this.loadCustomerNames();
    this.loadingBudget = false;
  } catch (err: any) {
    console.error(err);
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
  }
}

async clearBox() {
  await this.boxService.clearBox();
  await this.loadCart();

  this.grandTotal = 0;
  this.subtotal = 0;
  this.totalTroco = 0;
  this.total = null;
  this.generalDiscount = 0;

  // Resetando formas de pagamento
  this.payments = [];
  this.selectedPaymentMethod = '';
  this.firstPaymentMethod = '';
  this.secondPaymentMethod = '';
  this.firstPaymentAmount = 0;
  this.secondPaymentAmount = 0;
  this.isSplitPayment = false;
}



getQuantityInBudget(productId: string): { quantity: number, clients: string[] } {
  let quantity = 0;
  let clients: Set<string> = new Set();  // Usando Set para evitar duplicatas

  this.budgets.forEach(budget => {
    budget.budget.items.forEach(item => {
      if (item.product === productId) {
        quantity += item.quantity;
        clients.add(budget.client);  // Adiciona o nome do cliente ao Set
      }
    });
  });

  // Retorna a quantidade total do produto nos orçamentos e os nomes dos clientes únicos
  return { quantity, clients: Array.from(clients) };
}


openSidebar(product: Product): void {
  this.selectedProduct = product;

  const boxItem = this.boxItems.find(item => item._id === product._id);
  this.editedPrice = boxItem ? boxItem.price : product.price; // Valor inicial
  this.sidebarVisible = true;

  // Obter a quantidade real em estoque diretamente do banco
  this.productService.getProductById(product._id).subscribe({
      next: (productFromDb) => {
          if (!productFromDb) {
              this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: 'Produto não encontrado no estoque'
              });
              return;
          }

          // Calcula a quantidade disponível sem alterar selectedProduct
          const availableStock = this.calculateRealStock(productFromDb);

          // Exibe a quantidade disponível em estoque na barra lateral sem sobrescrever o valor do produto
          this.messageService.add({
              severity: 'info',
              summary: 'Estoque disponível',
              detail: `Quantidade disponível em estoque: ${availableStock}`
          });

          // Armazenar a quantidade de estoque em uma variável separada, sem sobrescrever a quantidade do produto
          this.availableStock = availableStock;
      },
      error: (err) => {
          console.error('Erro ao buscar produto pelo ID:', err);
          this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível verificar o estoque do produto.'
          });
      }
  });
}

calculateRealStock(product: Product): number {
  // Retorna a quantidade total do produto sem considerar o carrinho
  return product.quantity;
}


saveEditedPrice(): void {
  if (this.selectedProduct && this.editedPrice !== null) {
    const boxItem = this.boxItems.find(item => item._id === this.selectedProduct!._id);

    if (boxItem) {
      boxItem.price = this.editedPrice; // Atualiza o preço no array boxItems

      // Atualiza o sessionStorage
      sessionStorage.setItem('Box_Items', JSON.stringify(this.boxItems));

      this.calculateTotals(); // Recalcula os totais
      this.messageService.add({
        severity: 'success',
        summary: 'Preço Atualizado',
        detail: `O preço do produto "${this.selectedProduct.title}" foi atualizado para ${this.editedPrice}.`
      });
    }
    this.closeSidebar();
  }
}


closeSidebar(): void {
  this.sidebarVisible = false;
  this.selectedProduct = null;
  this.editedPrice = 0;
}


saveBoxAsPdf(): void {
  if (this.boxItems.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Nenhum item no caixa para salvar como PDF.',
    });
    return;
  }

  this.pdfService.saveBoxItemsAsPdf(this.boxItems, this.subtotal, this.grandTotal, this.generalDiscount);
  this.messageService.add({
    severity: 'success',
    summary: 'PDF Gerado',
    detail: 'O resumo do caixa foi salvo como PDF.',
  });
}

async printReceipt() {
  if (this.boxItems.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Nenhum item no caixa para imprimir como cupom.',
    });
    return;
  }

  try {
    // Chama o serviço para gerar e imprimir o cupom
    this.pdfService.printReceipt(
      this.boxItems,               // Itens do caixa
      this.subtotal,               // Subtotal
      this.grandTotal,             // Total com desconto
      this.generalDiscount,        // Desconto geral
      this.selectedPayment || 'Não especificado' // Método de pagamento
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Cupom Gerado',
      detail: 'O cupom foi gerado com sucesso.',
    });
  } catch (error) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Ocorreu um erro ao gerar o cupom fiscal.',
    });
    console.error('Erro ao gerar cupom:', error);
  }
}


}
