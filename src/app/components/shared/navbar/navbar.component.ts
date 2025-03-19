import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Security } from '../../../../utils/Security.util';
import { User } from '../../../../core/models/user.model';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { ImportsService } from '../../../../core/services/imports.service';
import { UploadService } from '../../../../core/api/upload/upload.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: true,
    imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, OverlayPanelModule, MenuModule, ImportsService.imports],
      providers: [ImportsService.providers, MessageService],
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;
  public user!: User;
  userItems: MenuItem[] = [];
  logoUrl: string = ''; // Variável para armazenar a URL da logo

  constructor(
    private router: Router,
    private uploadService: UploadService,

  ) {}

  ngOnInit() {

      this.user = Security.getUser();
      this.items = [
          { label: 'Produtos', icon: 'pi pi-list', routerLink: '/store' },
          { label: 'Frente de caixa', icon: 'pi pi-cart-plus', routerLink: '/sale' },
          { label: 'Orçamentos', icon: 'pi pi-clipboard', routerLink: '/budgets' },
          { label: 'Pedidos', icon: 'pi pi-list-check', routerLink: '/productsToBuy' },
          {
              label: 'Faturamento',
              icon: 'pi pi-external-link',
              items: [
                  { label: 'Vendas', icon: 'pi pi-dollar', routerLink: '/sales' },
                  { label: 'Faturamento mensal', icon: 'pi pi-chart-bar', routerLink: '/features/details' },
                  { label: 'Saídas', icon: 'pi pi-chart-line', routerLink: '/features/exits' }
              ]
          }
      ];

      this.userItems = [
          { label: 'Cadastro de usuário', icon: 'pi pi-user-plus', routerLink: '/account/new-user' },
          { label: 'Alterar senha', icon: 'pi pi-key', routerLink: '/account/passwordChange' },
          { label: 'Informações da empresa', icon: 'pi pi-building', routerLink: '/company' }
      ];

      this.updateActiveItem(this.router.url);

      this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
              this.updateActiveItem(event.urlAfterRedirects);
          }
      });

      this.loadCompanyLogo();
  }

  updateActiveItem(url: string) {
      this.activeItem = this.items.find((item) => item.routerLink === url);
  }

  loadCompanyLogo() {
      this.uploadService.getImages('logo').subscribe(
          (data: any) => {
              if (data && data.imageUrl) {
                  this.logoUrl = data.imageUrl; // URL da imagem recebida
              } else {
                  this.logoUrl = '../assets/image/default-logo.png'; // Fallback para uma imagem padrão
              }
          },
          (error) => {
              console.error('Erro ao carregar a logo:', error);
              this.logoUrl = '../assets/image/default-logo.png'; // Caso de erro, define uma imagem padrão
          }
      );
  }

  logout() {
    Security.clear();
    this.router.navigate(['/']);
  }
}
