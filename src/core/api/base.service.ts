import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Security } from '../../utils/Security.util';

export abstract class BaseService {
  protected http = inject(HttpClient);
  protected API = environment.API;

  protected composeHeaders() {
    const token = Security.getToken();
    return new HttpHeaders().set('x-access-token', token);
  }
}
