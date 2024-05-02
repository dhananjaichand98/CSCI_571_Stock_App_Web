import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPurchaseModalComponent } from './stock-purchase-modal.component';

describe('StockPurchaseModalComponent', () => {
  let component: StockPurchaseModalComponent;
  let fixture: ComponentFixture<StockPurchaseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockPurchaseModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockPurchaseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
