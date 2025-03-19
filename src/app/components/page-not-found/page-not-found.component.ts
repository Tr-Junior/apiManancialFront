import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ImportsService } from '../../../core/services/imports.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [ImportsService.imports],
    providers: [ImportsService.providers, MessageService],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {

}
