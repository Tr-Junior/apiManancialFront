import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitsPageComponent } from './exits-page.component';

describe('ExitsPageComponent', () => {
  let component: ExitsPageComponent;
  let fixture: ComponentFixture<ExitsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExitsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
