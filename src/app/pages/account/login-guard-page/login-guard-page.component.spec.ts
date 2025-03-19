import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginGuardPageComponent } from './login-guard-page.component';

describe('LoginGuardPageComponent', () => {
  let component: LoginGuardPageComponent;
  let fixture: ComponentFixture<LoginGuardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginGuardPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginGuardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
