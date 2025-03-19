import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPageComponent } from './chart-page.component';

describe('ChartPageComponent', () => {
  let component: ChartPageComponent;
  let fixture: ComponentFixture<ChartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
