import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmaVolumeChartComponent } from './sma-volume-chart.component';

describe('SmaVolumeChartComponent', () => {
  let component: SmaVolumeChartComponent;
  let fixture: ComponentFixture<SmaVolumeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmaVolumeChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmaVolumeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
