import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompanyDataService } from '../core/services/company-data.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ImportsService } from '../core/services/imports.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ImportsService.imports, RouterOutlet],
    providers: [ImportsService.providers, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  //title = 'frontend';

  constructor(
    private companyDataService: CompanyDataService,
    private primengConfig: PrimeNGConfig
  ) {}



  async ngOnInit(): Promise<void> {
    await this.companyDataService.loadInitialData();

    this.primengConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
      dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
      monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      today: "Hoje",
      clear: "Limpar"
    });
  }
}
