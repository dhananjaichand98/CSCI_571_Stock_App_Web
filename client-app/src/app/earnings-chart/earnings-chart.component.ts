import { Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';

declare var require: any;
const noData = require('highcharts/modules/no-data-to-display')

noData(Highcharts)

@Component({
  selector: 'app-earnings-chart',
  templateUrl: './earnings-chart.component.html',
  styleUrls: ['./earnings-chart.component.css']
})
export class EarningsChartComponent implements OnInit , OnChanges {

  @Input() earningChartInputData: any = {}
  public Highcharts:any = Highcharts;
  public highchartsConfig: any = {};
  updateFlag = false;

  constructor() { }
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['earningChartInputData']){
      this.getChartOptions()
    }
    this.updateFlag = false;
  }

  getChartOptions(){
    this.highchartsConfig = {
      chart: {
          type: 'spline',
      },
      options: {
        lang: {
            noData: "No data to display."
        }
      },
      title: {
          text: 'Historical EPS Surprise'
      },
      xAxis: {
          categories: this.earningChartInputData.xcateg
      },
      yAxis: {
          title: {
              text: 'Quarterly EPS'
          }
      },
      legend: {
          enabled: true
      },
      tooltip: {
          shared: true,
          useHTML: true,
          headerFormat: '{point.x}<br>',
          
      },
      plotOptions: {
          spline: {
              marker: {
                  enable: false
              }
          }
      },
      series: [{
          name: 'Actual',
          data: this.earningChartInputData.actual
      },{
          name: 'Estimate',
          data: this.earningChartInputData.estimate
      }]
    }
  }

}
