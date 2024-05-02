import { Component, Input, OnInit, HostListener, AfterViewInit } from '@angular/core';
import * as Highcharts from 'Highcharts/highstock';
import HData from 'highcharts/modules/data';
import HExporting from 'highcharts/modules/exporting';
import IndicatorsCore from 'highcharts/indicators/indicators';
import IndicatorZigzag from 'highcharts/indicators/zigzag';

IndicatorsCore(Highcharts);
IndicatorZigzag(Highcharts);
HData(Highcharts);
HExporting(Highcharts);

declare var require: any;
var vbp = require('highcharts/indicators/volume-by-price');
vbp(Highcharts);
const noData = require('highcharts/modules/no-data-to-display')
noData(Highcharts)

@Component({
  selector: 'app-sma-volume-chart',
  templateUrl: './sma-volume-chart.component.html',
  styleUrls: ['./sma-volume-chart.component.css']
})
export class SmaVolumeChartComponent implements OnInit, AfterViewInit {

  highcharts = Highcharts;
  highchartsConfig: any;
  isHighcharts = typeof Highcharts === 'object';
  Highcharts: typeof Highcharts = Highcharts;
  @Input() chartData: any = {};
  @Input() ticker: string = '';
  @Input() color:string='';
  ohlc: any = [];
  volume: any = [];
  xAxisVals: any = [];
  updateFlag:boolean = false;
  routside=true;

  constructor() {}
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      },1000)
  }

  ngOnChanges(changes: any): void{

    if (changes['chartData'] && this.chartData.t){
      this.formatchartData(this.chartData);
      this.getCharts();

    }
    this.updateFlag = true;
    setTimeout(() => {      
      window.dispatchEvent(new Event('resize'));
      },1000)
  }

  ngOnInit():void {

    this.formatchartData(this.chartData);
    this.getCharts();
    this.updateFlag = true;
    setTimeout(() => {
      
    window.dispatchEvent(new Event('resize'));
    },1000)

    this.highcharts.setOptions({
      lang: {
        rangeSelectorFrom: 'From',
        rangeSelectorTo: 'To'
      },
    });

  }

  formatchartData(data: any){

    this.ohlc = [];
    this.volume = [];

    if(!data || !data.t){
      return;
    }

    for(let index = 0; index < data.t.length; index++){
      this.ohlc.push([data.t[index] * 1000  , data.o[index], data.h[index], data.l[index], data.c[index]]);
      this.volume.push([data.t[index] * 1000, data.v[index]]);
    }
  }

  getCharts(){

    this.highchartsConfig = {     
      rangeSelector: {
        allButtonsEnabled: true,
        dropdown: 'never',
        selected: 2,
        inputStyle: {
          color: 'black'
        },
        inputBoxBorderColor: 'gray',
        enabled: true,
        inputBoxHeight: 18
      },
      options: {
        lang: {
            noData: "No data to display"
        }
      },
      title: {
          text: this.ticker + ' Historical',
          align: 'center',
      },
      subtitle: {
          text: 'With SMA and Volume by Price technical indicators'
      },
      navigator: {
        enabled: true,
      },
      scrollbar: {
        enabled: true,
        liveRedraw: true,
      },
      xAxis: {
        type: 'datetime'
      },
      legend: {
        enabled: false,
      },
      
      yAxis: [{
        opposite: true,
        labels: {
            align: 'center',
            x: -25,
            y: -2,
        },
        title: {
            text: 'OHLC',
            offset: 5
        },
        height: '60%',
        lineWidth: 1,
        startOnTick: true,
      },
      {
        opposite: true,
        startOnTick: true,
        labels: {
            align: 'center',
            x: -30,
            y: -2,
        },
        title: {
            text: 'Volume',
            offset: 5
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 1,
      }],

      tooltip: {
          split: true
      },

      plotOptions: {},

      series: [{
          type: 'candlestick',
          name: this.ticker,
          id: this.ticker,
          zIndex: 2,
          data: this.ohlc
      }, {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: this.volume,
          yAxis: 1
      }, {
          type: 'vbp',
          linkedTo: this.ticker,
          params: {
              volumeSeriesID: 'volume'
          },
          dataLabels: {
              enabled: false
          },
          zoneLines: {
              enabled: false
          }
      }, {
          type: 'sma',
          linkedTo: this.ticker,
          zIndex: 1,
          marker: {
              enabled: false
          }
      }],
      
    }

  }    

  
  
}
