import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { MessageService } from 'primeng/api';
import { LOCALE_ID } from '@angular/core';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
    MessageService,
    ...(appConfig.providers || [])
  ]
})
.catch(err => console.error(err));
