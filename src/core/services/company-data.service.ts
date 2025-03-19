import { Injectable } from '@angular/core';
import { CompanyService } from '../api/company/company.service';
import { ICompany } from '../models/company.model';
import { UploadService } from '../api/upload/upload.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CompanyDataService {
  public company: ICompany[] = [];
  public logoImage: { filePath: string } | null = null;
  public pdfImage: { filePath: string } | null = null;

  constructor(
    private companyService: CompanyService,
    private uploadService: UploadService,
    private messageService: MessageService
  ) {}

  async loadInitialData(): Promise<void> {
    try {
      await this.listCompany();
      await this.getImages();
      this.updateTabInfo();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar os dados iniciais'
      });
    }
  }

  private async listCompany(): Promise<void> {
    const savedData = localStorage.getItem('companyData');

    if (savedData) {
      this.company = [JSON.parse(savedData)];
      return;
    }

    try {
      const data = await this.companyService.getCompany().toPromise();
      if (data && data.length > 0) {
        this.company = data;
        localStorage.setItem('companyData', JSON.stringify(data[0]));
        this.updateTabInfo();
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar os dados da empresa'
      });
      throw error;
    }
  }
  private async getImages(): Promise<void> {
    try {
      if (!localStorage.getItem('companyLogo')) {
        const logoData = await this.uploadService.getImages('logo').toPromise();
        if (logoData?.imageUrl) {
          this.logoImage = { filePath: logoData.imageUrl };
          localStorage.setItem('companyLogo', logoData.imageUrl);
        }
      } else {
        this.logoImage = { filePath: localStorage.getItem('companyLogo')! };
      }

      if (!localStorage.getItem('companyPdf')) {
        const pdfData = await this.uploadService.getImages('pdf').toPromise();
        if (pdfData?.imageUrl) {
          this.pdfImage = { filePath: pdfData.imageUrl };
          localStorage.setItem('companyPdf', pdfData.imageUrl);
        }
      } else {
        this.pdfImage = { filePath: localStorage.getItem('companyPdf')! };
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  }

  /**
   * Atualiza o título da aba e o favicon
   */
  private updateTabInfo(): void {
    if (this.company.length > 0) {
      // Adiciona um pequeno delay para garantir que o título seja atualizado corretamente
      setTimeout(() => {
        document.title = this.company[0]?.name || 'Minha Empresa';
      }, 100);
    } else {
      console.warn('Nenhuma empresa encontrada para atualizar o título da aba.');
    }

    if (this.logoImage?.filePath) {
      this.updateFavicon(this.logoImage.filePath);
    }
  }

  /**
   * Atualiza o favicon da aba com a logo da empresa
   */
  private updateFavicon(logoUrl: string): void {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.href = logoUrl;
  }
}
