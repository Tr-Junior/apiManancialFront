import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../components/shared/navbar/navbar.component";

@Component({
  selector: 'app-frame-page',
  template: '<app-navbar></app-navbar><router-outlet></router-outlet>',
  standalone: true,
  imports: [NavbarComponent, RouterModule],
})
export class FramePageComponent {}

