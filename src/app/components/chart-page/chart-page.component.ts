import { Component } from '@angular/core';
import { Entrances } from '../../../core/models/entrances.model';
import { Exits } from '../../../core/models/exits.model';
import { ImportsService } from '../../../core/services/imports.service';
import { EntrancesService } from '../../../core/api/entrances/entrances.service';
import { ExitsService } from '../../../core/api/exits/exits.service';

@Component({
  selector: 'app-chart-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers],
  templateUrl: './chart-page.component.html',
  styleUrl: './chart-page.component.css'
})
export class ChartPageComponent {
  public exits: Exits[] = [];
  public entrances: Entrances[] = [];
  public startDate: any;
  public endDate: any;
  public name: any;
  public saldo: number = 0;

  public totalEntrances: number = 0;
  public totalExits: number = 0;
  public result: number = 0;

  public data: any[] = [];
  public options: any;
  public chartData: any;
  public chartOptions: any;

  constructor(
    private exitsService: ExitsService,
    private entrancesService: EntrancesService,
  ) { }

  ngOnInit() {
    this.listEntrances();
    this.listExits();
  }

  listExits() {
    const currentYear = new Date().getFullYear();
    this.exitsService.getExits().subscribe((data: any) => {
      this.exits = data.filter((exit: Exits) => {
        const exitDate = new Date(exit.date);
        return exitDate.getFullYear() === currentYear;
      });
      this.calculateResult();
      this.generateChartData();
    });
  }

  listEntrances() {
    const currentYear = new Date().getFullYear();
    this.entrancesService.getEntrances().subscribe((data: any) => {
      this.entrances = data.filter((entrance: Entrances) => {
        const entranceDate = new Date(entrance.createDate);
        return entranceDate.getFullYear() === currentYear;
      });
      this.calculateResult();
      this.generateChartData();
    });
  }



  searchDate() {
    if (this.startDate && this.endDate) {
      this.getInOutByDateRange(this.startDate, this.endDate);
    } else {
      this.listExits();
    }
  }

  getInOutByDateRange(startDate: string, endDate: string) {
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
            this.generateChartData();
          }
        );
      }
    );
  }

  calculateResult() {
    this.totalExits = this.exits.reduce((sum, exit) => sum + exit.value, 0);
    this.totalEntrances = this.entrances.reduce((sum, entrance) => sum + entrance.value, 0);
    this.result = this.totalEntrances - this.totalExits;
  }

  generateChartData() {
    const chartData: any[] = [];
    const months: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    for (let i = 0; i < 12; i++) {
      const monthData: any = {
        month: months[i],
        entrances: 0,
        exits: 0,
        balance: 0
      };

      const monthEntrances = this.entrances.filter((entrance: Entrances) => new Date(entrance.createDate).getMonth() === i);
      const monthExits = this.exits.filter((exit: Exits) => new Date(exit.date).getMonth() === i);

      monthData.entrances = monthEntrances.reduce((sum, entrance) => sum + entrance.value, 0);
      monthData.exits = monthExits.reduce((sum, exit) => sum + exit.value, 0);
      monthData.balance = monthData.entrances - monthData.exits;

      chartData.push(monthData);
    }

    this.chartData = {
      labels: chartData.map(data => data.month),
      datasets: [
        {
          label: 'Total de entradas',
          data: chartData.map(data => data.entrances),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Total de saídas',
          data: chartData.map(data => data.exits),
          backgroundColor: 'rgba(192, 75, 75, 0.2)',
          borderColor: 'rgba(192, 75, 75, 1)',
          borderWidth: 1
        },
        {
          label: 'Balanço',
          data: chartData.map(data => data.balance),
          backgroundColor: 'rgba(192, 192, 75, 0.2)',
          borderColor: 'rgba(192, 192, 75, 1)',
          borderWidth: 1
        }
      ]
    };


  this.chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number) {
            return value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            return value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
          }
        }
      }
    }
  };
}
}



