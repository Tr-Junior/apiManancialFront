import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';;
import { Image } from '../../../core/models/image.model';
import { UploadService } from '../../../core/api/upload/upload.service';
import { ImportsService } from '../../../core/services/imports.service';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [ImportsService.imports],
  providers: [ImportsService.providers, MessageService],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.css'
})
export class UploadPageComponent {
  files: File[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  uploadType: 'logo' | 'pdf' = 'logo'; // Tipo de upload atual ('logo' ou 'pdf')
  logoImage: { filePath: string } | null = null;
  pdfImage: { filePath: string } | null = null;
  public imageUpload: Image[] = [];

  constructor(
    private messageService: MessageService,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.getImages();
  }
  choose(event: any, callback: () => void) {
    callback();
  }

  onRemoveTemplatingFile(event: any, file: File, removeFileCallback: (file: any, index: any) => void, index: number) {
    removeFileCallback(file, index);
    this.totalSize -= file.size;
    this.totalSizePercent = this.totalSize / 10;
  }

  onClearTemplatingUpload(clear: () => void) {
    clear();
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  onTemplatedUpload(event?: any, clearCallback?: () => void) {
    const formData = new FormData();

    // Adiciona cada arquivo com o nome original
    this.files.forEach((file) => {
      formData.append('file', file, file.name);
    });

    console.log('Enviando arquivos:', this.files); // Para depuração

    const uploadObservable = this.uploadType === 'logo'
      ? this.uploadService.uploadLogo(formData)
      : this.uploadService.uploadPdf(formData);

    uploadObservable.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Concluído',
          detail: `${this.uploadType.toUpperCase()} enviado com sucesso.`,
          life: 3000
        });

        // Buscar a imagem atualizada do banco de dados
        this.getImages();
        this.clear();

        if (clearCallback) {
          clearCallback();
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Upload',
          detail: `Não foi possível enviar o ${this.uploadType.toUpperCase()}.`,
          life: 3000
        });
      }
    });
  }


  onSelectedFiles(event: any) {
    this.files = event.currentFiles;
    console.log('Arquivos selecionados:', this.files); // Verifique se os arquivos estão sendo capturados corretamente
    this.totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
    this.totalSizePercent = this.totalSize / 10;
  }

  uploadEvent(callback: () => void) {
    // Aqui chamamos diretamente o upload, em vez de passar o callback sem fazer nada
    this.onTemplatedUpload(); // Chame a função de upload real
  }

  changeUploadType(type: 'logo' | 'pdf') {
    this.uploadType = type;
  }

  getImages() {
    this.uploadService.getImages('logo').subscribe(
      (data: Image) => {
        if (data && data.imageUrl) {
          // Garantir que a URL seja HTTPS
          if (data.imageUrl.startsWith('http://')) {
            data.imageUrl = data.imageUrl.replace('http://', 'https://');
          }

          this.logoImage = { filePath: data.imageUrl };
          localStorage.setItem('companyLogo', data.imageUrl);
        } else {
          console.warn('Nenhuma logo encontrada');
        }
      },
      (error) => {
        console.error('Erro ao buscar logo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao carregar logo',
          detail: 'Não foi possível carregar a logo.',
          life: 3000
        });
      }
    );

    this.uploadService.getImages('pdf').subscribe(
      (data: Image) => {
        if (data && data.imageUrl) {
          // Garantir que a URL seja HTTPS
          if (data.imageUrl.startsWith('http://')) {
            data.imageUrl = data.imageUrl.replace('http://', 'https://');
          }

          this.pdfImage = { filePath: data.imageUrl };
          localStorage.setItem('companyPdf', data.imageUrl);
        } else {
          console.warn('Nenhuma imagem de PDF encontrada');
        }
      },
      (error) => {
        console.error('Erro ao buscar PDF:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao carregar PDF',
          detail: 'Não foi possível carregar o PDF.',
          life: 3000
        });
      }
    );
  }

  clear() {
    this.files = [];
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }
}
