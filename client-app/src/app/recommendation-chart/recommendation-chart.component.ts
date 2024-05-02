import { HighchartsChartModule } from 'highcharts-angular';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-recommendation-chart',
  templateUrl: './recommendation-chart.component.html',
  styleUrls: ['./recommendation-chart.component.css']
})
export class RecommendationChartComponent implements OnInit, OnChanges {

  @Input() chartInputData: any = {}
  public Highcharts:any = Highcharts;
  public highchartsConfig: any = {};
  updateFlag:any = false;

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges(changes: any): void{
    if (changes['chartInputData']){
      this.getChartOptions()
    }
    this.updateFlag = true;
  }

  getChartOptions(){

    let colors = ["#2d473a", "#1d8c54", "#bc8c1d", "#f4585a", "#803131"]
    this.highchartsConfig ={
      chart: {
        type: 'column',
      },
      title: {
          text: `Recommendation Trends`
      },
      colors: colors,
      xAxis: {
          categories: this.chartInputData.xcateg
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Analysis'
          },
          stackLabels: {
              enabled: false,              
          }
      },
      legend: {
          align: 'center',
          verticalAlign: 'bottom',
          backgroundColor:
              this.Highcharts.defaultOptions.legend.backgroundColor || 'white',
          shadow: false
      },
      tooltip: {
      },
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: true
              }
          }
      },
      series: [{
          name: 'Strong Buy',
          data: this.chartInputData.strongBuy
      }, {
          name: 'Buy',
          data: this.chartInputData.buy
      }, {
          name: 'Hold',
          data: this.chartInputData.hold
      }, {
          name: 'Sell',
          data: this.chartInputData.sell
      }, {
          name: 'Strong Sell',
          data: this.chartInputData.strongSell
      }]
  }
  }

}