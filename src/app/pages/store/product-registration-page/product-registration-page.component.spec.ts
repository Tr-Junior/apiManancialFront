import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRegistrationPageComponent } from './product-registration-page.component';

describe('ProductRegistrationPageComponent', () => {
  let component: ProductRegistrationPageComponent;
  let fixture: ComponentFixture<ProductRegistrationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRegistrationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductRegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
