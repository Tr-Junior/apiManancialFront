import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsPageComponent } from './costs-page.component';

describe('CostsPageComponent', () => {
  let component: CostsPageComponent;
  let fixture: ComponentFixture<CostsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
