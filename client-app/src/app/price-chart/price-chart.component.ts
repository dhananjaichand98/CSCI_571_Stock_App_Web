import { Component, Input, OnInit, OnChanges, HostListener, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts';

declare var require: any;
const noData = require('highcharts/modules/no-data-to-display')
noData(Highcharts)

@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})
export class PriceChartComponent implements OnInit  {

  @Input() ticker: string = '';
  @Input() chart_data: any = {};
  @Input() color: string = '';
  updateFlag:boolean = true;
  highcharts:any = Highcharts;
  highchartsData:any ;
  highchartsConfig:any;

  constructor () {}

  ngOnInit(): void {
    if (this.chart_data && this.chart_data.c){
      
      let temp:any = [];
      for(let i=0;i<this.chart_data.c.length; i++){
        temp.push([this.chart_data.t[i]*1000-(7*60*60*1000), this.chart_data.c[i]]);
      }
      this.highchartsData = temp;
      
    }
    this.setChartsData();
    window.dispatchEvent(new Event('resize'));
  }

  ngOnChanges(){
    if (this.chart_data && this.chart_data.c){  
      let temp:any = [];
      for(let i=0;i<this.chart_data.c.length; i++){
        temp.push([this.chart_data.t[i]*1000-(7*60*60*1000), this.chart_data.c[i]]);
      }
      this.highchartsData = temp;
      this.updateFlag = true;
    }
    this.setChartsData();
  }

  setChartsData(){
    
    this.highchartsConfig = {
      chart: {
        type: 'line',
        height: 400,
      },
      options: {
        lang: {
            noData: "No data to display"
        }
      },
      title: {
        text: `${this.ticker} Hourly Price Variation`,
        style: {
          color: '#848484',
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: true
      },
      yAxis: [
        {
          title: {
            text: '',
          },
          opposite: true,
        }
      ],

      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%H:%M}'
        },  

        crosshair:{
          enabled:true,
          label:{
            enabled:true,
            format: '{value:2f}'
          }
        },
        dateTimeLabelFormats: {
          minute:'%h:%m',
          hour:'%h:%m',
        },
          
      },
      tooltip: {
        split: true,
        crosshair:true,
      },
      series: [
        {
          name: this.ticker,
          color: this.color,
          data: this.highchartsData,
          yAxis: 0,
          tooltip: {
            valueDecimals: 2
          },
        
          fillColor: {
              linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
              },
              stops: [
                  [0, this.highcharts.getOptions().colors[0]],
                  [1, Highcharts.color(this.highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
          },
        }
      ],
      
      plotOptions: {
        series:{
            pointWidth: 5,
            pointPlacement: 'on',
        }
      }
    }

    this.updateFlag = true;
  }


}