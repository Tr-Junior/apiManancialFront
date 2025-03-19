import { Component } from '@angular/core';
import { ImportsService } from '../../../../core/services/imports.service';
import { Product } from '../../../../core/models/product.model';
import { Entrances } from '../../../../core/models/entrances.model';
import { Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { Exits } from '../../../../core/models/exits.model';
import { Security } from '../../../../utils/Security.util';
import { ChartPageComponent } from '../../../components/chart-page/chart-page.component';
import { ExitsService } from '../../../../core/api/exits/exits.service';
import { EntrancesService } from '../../../../core/api/entrances/entrances.service';
import { ProductService } from '../../../../core/api/products/product.service';

@Component({
  selector: 'app-costs-page',
  standalone: true,
  imports: [ImportsService.imports, ChartPageComponent],
  providers: [ImportsService.providers],
  templateUrl: './costs-page.component.html',
  styleUrl: './costs-page.component.css'
})
export class CostsPageComponent {

  public exits: Exits[] = [];
  public entrances: Entrances[] = [];
  public startDate: any;
  public endDate: any;
  public name: any;
  public saldo: number = 0;
  public totalEntrances: number = 0;
  public totalExits: number = 0;
  public result: number = 0;
  public ptBR: any;
  public data: any[] = [];
  public options: any;
  public rangeDates?: Date[];
  public busy = false;
  totalPurchaseValue: number = 0;
  product: Product[] = [];

  constructor(
    private exitsService: ExitsService,
    private entrancesService: EntrancesService,
    private productService: ProductService,
    private primengConfig: PrimeNGConfig,
    private router: Router

  ) {}

  ngOnInit() {
    Security.clearPass();
    const sessionUser = Security.getPass();
    if (sessionUser) {
      this.router.navigate(['/login']);
    }
    this.listEntrances();
    this.listExits();
    this.primengConfig.setTranslation(this.ptBR);
    this.listProd();
  };

  listExits() {
    this.exitsService.getExits().subscribe((data: any) => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      this.exits = data.filter((exit: Exits) => {
        const exitDate = new Date(exit.date);
        return exitDate.getMonth() === currentMonth && exitDate.getFullYear() === currentYear;
      });
      this.totalExits = this.exits.reduce((sum, exit) => sum + exit.value, 0);
      this.calculateResult();
    });
  }

  listEntrances() {
    this.entrancesService.getEntrances().subscribe((data: any) => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      this.entrances = data.filter((entrance: Entrances) => {
        const entranceDate = new Date(entrance.createDate);
        return entranceDate.getMonth() === currentMonth && entranceDate.getFullYear() === currentYear;
      });
      this.totalEntrances = this.entrances.reduce((sum, entrance) => sum + entrance.value, 0);
      this.calculateResult();
    });
  }

  search() {
    if (this.name == "") {
      this.ngOnInit();
    } else {
      this.entrances = this.entrances.filter(res => {
        return res.typeOrder.toLocaleLowerCase().match(this.name.toLocaleLowerCase());
      })
    }
  }

  searchDate() {
    if (this.rangeDates && this.rangeDates.length > 0) {
      const startDate = this.rangeDates[0];
      const endDate = this.rangeDates.length > 1 ? this.rangeDates[1] : startDate;
      this.getInOutByDateRange(startDate, endDate);
    } else {
      this.listExits();
    }
  }

  getInOutByDateRange(startDate: Date, endDate: Date) {
    this.exitsService.getExits().subscribe(
      (exitsData: any) => {
        this.entrancesService.getEntrances().subscribe(
          (entrancesData: any) => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            this.exits = exitsData.filter((exit: Exits) => {
              const date = new Date(exit.date);
              return date >= start && date <= end;
            });
            this.entrances = entrancesData.filter((entrance: Entrances) => {
              const date = new Date(entrance.createDate);
              return date >= start && date <= end;
            });
            this.totalExits = this.exits.reduce((sum, exit) => sum + exit.value, 0);
            this.totalEntrances = this.entrances.reduce((sum, entrance) => sum + entrance.value, 0);
            this.calculateResult();
          }
        );
      }
    );
  }

  calculateResult() {
    this.result = this.totalEntrances - this.totalExits;
  }

  clearSearch() {
    this.rangeDates = [];
    this.listExits();
    this.listEntrances();
  }

  listProd(page: number = 1, limit: number = 3000) {
    this.busy = true;

    const params = { page: page.toString(), limit: limit.toString() };

    this.productService.getProducts(params).subscribe(
      (data: any) => {
        this.busy = false;
        this.product = data.data; // Ajuste se a resposta do backend tiver um campo "data"
        this.totalPurchaseValue = this.calculateTotalPurchaseValue(this.product);
      },
      (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.busy = false;
      }
    );
  }


  calculateTotalPurchaseValue(products: Product[]): number {
    let totalValue = 0;
    for (const product of products) {
      totalValue += product.purchasePrice * product.quantity;
    }
    return totalValue;
  }
}
