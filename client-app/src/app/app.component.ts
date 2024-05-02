import { Component, OnInit } from '@angular/core';
import {SearchStateService} from './search-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  title = 'client-app';
  ticker = '';
  state:any;

  constructor(private searchStateService: SearchStateService) {}

  ngOnInit(): void {
    
    this.searchStateService.state$.subscribe(e => {
      if(e && 'tickerVal' in e && e.tickerVal != ''){
        this.ticker = e.tickerVal;
      }
      else{
        this.ticker = 'home';
      }
    })

  }

}
