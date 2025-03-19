import { Observable } from "rxjs";
import { BaseService } from "../base.service";
import { Injectable } from "@angular/core";
import { Image } from "../../models/image.model";

@Injectable({
  providedIn: 'root'
})

export class UploadService extends BaseService {

  uploadLogo(data: FormData): Observable<{ image: { filePath: string } }> {
    console.log('Enviando logo para o servidor:', data);
    return this.http.post<{ image: { filePath: string } }>(
      `${this.API}/image/upload/logo`,
      data,
      { headers: this.composeHeaders() }
    );
  }

  uploadPdf(data: FormData): Observable<{ image: { filePath: string } }> {
    console.log('Enviando PDF para o servidor:', data);
    return this.http.post<{ image: { filePath: string } }>(
      `${this.API}/image/upload/pdf`,
      data,
      { headers: this.composeHeaders() }
    );
  }

  getImages(type: string): Observable<Image> {
    return this.http.get<Image>(`${this.API}/image/image?type=${type}`, { headers: this.composeHeaders() });
  }
}
