import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPageComponent } from './supplier-page.component';

describe('SupplierPageComponent', () => {
  let component: SupplierPageComponent;
  let fixture: ComponentFixture<SupplierPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
