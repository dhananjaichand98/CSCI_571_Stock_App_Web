import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendationChartComponent } from './recommendation-chart.component';

describe('RecommendationChartComponent', () => {
  let component: RecommendationChartComponent;
  let fixture: ComponentFixture<RecommendationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecommendationChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
