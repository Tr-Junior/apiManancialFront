import { Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TabMenuModule } from 'primeng/tabmenu';
import { CalendarModule } from 'primeng/calendar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DividerModule } from 'primeng/divider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AutoFocusModule } from 'primeng/autofocus';


// PrimeNG Services
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { PasswordModule } from 'primeng/password';
import { ScrollerModule } from 'primeng/scroller';

// Registro da localidade brasileira
registerLocaleData(localePt, 'pt-BR');

@Injectable({
  providedIn: 'root',
})
export class ImportsService {
  static imports = [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TableModule,
    ToastModule,
    TagModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    InputNumberModule,
    DialogModule,
    RippleModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextareaModule,
    FileUploadModule,
    RadioButtonModule,
    RatingModule,
    TooltipModule,
    SkeletonModule,
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    CommonModule,
    ButtonModule,
    TabMenuModule,
    CurrencyMaskModule,
    CalendarModule,
    SplitButtonModule,
    ReactiveFormsModule,
    CardModule,
    ChartModule,
    PasswordModule,
    OverlayPanelModule,
    SidebarModule,
    InputIconModule,
    IconFieldModule,
    DividerModule,
    ToggleButtonModule,
    SelectButtonModule,
    ProgressSpinnerModule,
    ScrollerModule,
    InputGroupModule,
    AutoFocusModule,
    InputGroupAddonModule
  ];

  static providers = [
    MessageService,
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'pt-BR' } // Configura o LOCALE_ID para 'pt-BR'
  ];
}
