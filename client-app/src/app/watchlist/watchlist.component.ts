// import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CompanyService } from '../company.service';
import {zip} from 'rxjs';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  watchlist:any;
  isEmpty:boolean = false;
  showLoader:boolean = false;
  readonly WATCHLIST:string = 'userWatchlist';
  isAPIResponseExeeded:boolean = false;
  isAPIResponseExeededMessage:string = 'API limit reached, please try after some time';
  isAPIResponseExeededSubscription:any;

  localStorage:any;
  constructor(private _router: Router, private companyService: CompanyService,) {
    this.localStorage = window.localStorage;
  }

  get watchlistValuesArray(): any[]{
    return Object.values(this.watchlist);
  }

  set watchlistValuesArray(value){

  }

  updateFetchedData(){
    
    this.isAPIResponseExeeded = false;

    let quoteObservables = Object.keys(this.watchlist).map(ticker => {
      return this.companyService.getCompanyStockPrice(ticker);
    })

    if(!quoteObservables || quoteObservables.length == 0){
      this.showLoader = false;
      return;
    }

    this.showLoader = true;
    
    zip(quoteObservables).subscribe((responses:any)=>{
        this.showLoader = false;

        let watchlistKeys = Object.keys(this.watchlist);
        console.log(responses);
        for(let i=0; i<watchlistKeys.length; i++){

          if(responses[i].errorData && typeof(responses[i].errorData) === 'string' && responses[i].errorData.includes('429') ){
            this.isAPIResponseExeeded = true;
            this.watchlist = {};
            if(this.isAPIResponseExeededSubscription){
              clearTimeout(this.isAPIResponseExeededSubscription);
            }
  
            this.isAPIResponseExeededSubscription = setTimeout(() => {this.isAPIResponseExeeded = false}, 5.0*1000);
            
            return;
          }

          this.watchlist[watchlistKeys[i]].c = responses[i].c || 0;
          this.watchlist[watchlistKeys[i]].d = responses[i].d || 0;
          this.watchlist[watchlistKeys[i]].dp = responses[i].dp || 0;
        }

        this.localStorage.setItem(this.WATCHLIST, JSON.stringify(this.watchlist));
    }, (error) => {
      this.isAPIResponseExeeded = true;
      this.watchlist = {};
      if(this.isAPIResponseExeededSubscription){
        clearTimeout(this.isAPIResponseExeededSubscription);
      }
      this.isAPIResponseExeededSubscription = setTimeout(() => {this.isAPIResponseExeeded = false}, 5.0*1000);
      return;
    });

  }

  ngOnInit(): void {

    let currWatchlist = this.localStorage.getItem(this.WATCHLIST);

    if(!currWatchlist || Object.keys(currWatchlist).length == 0 || JSON.stringify(currWatchlist) == '"{}"'){
      currWatchlist = {};
      this.watchlist = {};
      this.isEmpty = true;
    }
    else{
      this.watchlist = JSON.parse(currWatchlist);
      this.isEmpty = false;
      this.updateFetchedData();
    }

  }

  removeItem(watchlistItem:any){
    delete this.watchlist[watchlistItem.ticker]; 

    if(this.watchlist == {} || Object.keys(this.watchlist).length == 0|| JSON.stringify(this.watchlist) == '"{}"'){
      this.watchlist = {};
      this.isEmpty = true;
    }

    this.updateFetchedData();

    this.localStorage.setItem(this.WATCHLIST, JSON.stringify(this.watchlist));
  }

  priceChange(watchlistItem:any): number{
    if(watchlistItem.dp == 0){
      return 0;
    }
    else if(watchlistItem.dp > 0){
      return 1;
    }
    else{
      return 2;
    }
  }

  routeToSearch(ticker:string){
    this._router.navigateByUrl(`/search/${ticker}`);
  }

}
