import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInfoPageComponent } from './company-info-page.component';

describe('CompanyInfoPageComponent', () => {
  let component: CompanyInfoPageComponent;
  let fixture: ComponentFixture<CompanyInfoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyInfoPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyInfoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
