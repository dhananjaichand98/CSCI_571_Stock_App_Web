import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { SearchService } from '../search.service';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { SearchStateService } from '../search-state.service';
import { CompanyService } from '../company.service';
import { interval, forkJoin, of, zip, timer, throwError, catchError } from 'rxjs';
import {QuoteInterface, CompanyProfileInterface, StockCandlesInterface, NewsInterface, PeersInterface, PeersResult} from '../interface';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  tickerSymbol:string = '';
  tickerVal:string = '';
  tickerValForChild:string = '';
  options:any[] = [];
  filteredOptions : Observable<string[]>;
  searchFormControl = new FormControl();
  lastKeyPress:number = 0;
  displayResult:boolean = false;
  state:any;
  inputTickerText:string = '';
  isParentStateSaved:boolean = true;
  directUrlSearchTicker:any = '';
  noTickerEntered:boolean = false;
  notValidTicker:boolean = false;
  noTickerEnteredAlertMessage:string;
  notValidTickerAlertMessage:string;
  dataLoadedFromState:any;
  localStorage:any; 
  isAlreadyInited:boolean = false;
  showSpinner:boolean = false;
  quotesSubscription:any;
  candleForTwoYears:any;
  recommendation:any;
  earnings:any;
  readonly WATCHLIST:string = 'userWatchlist';

  constructor(
    private service: SearchService, 
    private _router: Router, 
    private searchStateService: SearchStateService, 
    private router: Router,
    private companyService: CompanyService,
    ) {
    this.filteredOptions = new Observable<string[]>();
    this.noTickerEnteredAlertMessage = 'Please enter a valid ticker';
    this.notValidTickerAlertMessage = 'No data found. Please enter a valid Ticker';
    this.localStorage = window.localStorage;
    this.router.events.subscribe((event: any) => {
        if(event.url){
          const segments = event.url.split('/');
          const last = segments.pop() || segments.pop(); // Handle potential trailing slash
          if(last !== 'home' && last !== 'search'){
            this.directUrlSearchTicker = last;
          }
          else
            this.directUrlSearchTicker = '';
        }
    })
  }

  public get priceChange():number{
    if(!this.quote || this.quote.dp == 0){
      return 0;
    }
    else if(this.quote && this.quote.dp > 0){
      return 1;
    }
    else{
      return 2;
    }
  }

  set priceChange(value){ }

  initiQuoteDataSubscription:any;

  ngOnInit(): void {

    this.isAlreadyInited = true;
    this.allmentions = {};
    this.allmentions.reddit = {};
    this.allmentions.twitter = {};
    this.allmentions.reddit.mention = 0;
    this.allmentions.reddit.posmention = 0;
    this.allmentions.reddit.negmention = 0;
    this.allmentions.twitter.mention = 0;
    this.allmentions.twitter.posmention = 0;
    this.allmentions.twitter.negmention = 0;

    this.noTickerEntered = false;
    this.notValidTicker = false;
    this.state = this.searchStateService.state$.getValue() || {};
    if(Object.keys(this.state).length != 0 && (!this.directUrlSearchTicker || this.directUrlSearchTicker.toUpperCase() == this.state.tickerVal.toUpperCase())){

      this.isParentStateSaved = true;

      if(!this.state.tickerVal || this.state.tickerVal === '_GOHOME'){
        this.displayResult = false;
        this.tickerVal = '';
        this.tickerSymbol = '';
        this.dataLoadedFromState = true;
        this._router.navigateByUrl(`/search/home`);
        return;
      }

      this.tickerVal = this.state.tickerVal.toUpperCase();

      // company
      this.companyProfile = this.state.companyProfile;
      // quote
      this.quote = this.state.quote;
      // candle 
      this.candle = this.state.candle;
      this.stockCurrentTime = new Date();
      this.getMarketOpenStatus();

      if(this.initiQuoteDataSubscription){
        clearTimeout(this.initiQuoteDataSubscription);
      }

      this.initiQuoteDataSubscription = setTimeout(()=>this.getQuotesRepeatedly(), 15000);

      // peers
      this.peers = this.state.peers;
      // insights
      this.allmentions = this.state.allmentions;
      // news
      this.news = this.state.news;
      // candle for 2 years
      this.candleForTwoYears = this.state.candleForTwoYears;
      // recommendation
      this.recommendation = this.state.recommendation;
      // earnings
      this.earnings = this.state.earnings;

      this._router.navigateByUrl(`/search/${this.tickerVal}`);
      this.dataLoadedFromState = true;
      this.showResults();

    }
    else if(this.directUrlSearchTicker){
      this.tickerVal = this.directUrlSearchTicker;
      this.parseTicker();
      if(this.tickerVal){
        this.dataLoadedFromState = false;
        setTimeout(()=>{
          this.callBackendAPI();
        },1000)  
      }
    }

    this.searchFormControl.valueChanges.subscribe(value => {
      if(value){
        this.getDataForAutocomplete(value);
      }
    });

  }

  updateState(key:string, value:any) {
    this.state[key] = value;
    this.searchStateService.state$.next(this.state);
  }

  companyProfile = {} as CompanyProfileInterface;
  quote = {} as QuoteInterface;
  peers = {} as PeersInterface;
  news = [{}] as NewsInterface[];
  candle = {} as StockCandlesInterface;
  stockCurrentTime:any;
  isMarketOpen:any;
  marketMsg:any;
  insightdata:any;
  allmentions:any;
  isPositivePriceChange:boolean = false;
  showMainPageSpinner:boolean = false;
  
  parseTicker(){
    const regexp = /^\S*$/;
    if(this.tickerVal){
      this.tickerVal = this.tickerVal.trim();
      let matched = this.tickerVal.match(regexp);
      if(matched){
        this.tickerVal = matched[0];
      }
      else{
        this.tickerVal = ''
      }
    }
  }

  combinedBackendCallSubscription:any;
  notValidTickerSubscription:any;
  isAPIResponseExeeded:boolean = false;
  isAPIResponseExeededSubscription:any;
  isAPIResponseExeededMessage:string = 'API limit reached, please try after some time';

  callBackendAPI(){

    this.clearResults();
    this.showMainPageSpinner = true;

    // company profile
    let observable1 = this.companyService.getCompanyProfile(this.tickerVal);
    // quotes
    let observable2 = this.getQuotesRepeatedly();
    // peers
    let observable3 = this.companyService.getCompanyPeers(this.tickerVal);
    // history
    let observable4 = this.companyService.getCompanyHistory(this.tickerVal, '1', '', '');
    // insights
    let observable5 = this.companyService.getCompanySocialSentiment(this.tickerVal, '2022-01-01');
    // news
    const today = new Date().toISOString().slice(0, 10);
    const before = this.getPrevDate(1, 0, 0).toISOString().slice(0, 10);
  
    let observable6 = this.companyService.getCompanyNews(this.tickerVal, before, today);

    // candle for 2 years for volume
    let to = dayjs().unix();
    let from = (dayjs().subtract(2, 'years')).unix();
    let resolution = 'D'

    let observable7 = this.companyService.getCompanyHistory(this.tickerVal, resolution, from, to);
    let observable8 = this.companyService.getCompanyRecommendationTrends(this.tickerVal);
    let observable9 = this.companyService.getCompanyEarning(this.tickerVal);

    const combined = zip(
      [observable1,  observable3, observable4, observable5, observable6, observable7, observable8, observable9]
    )

    if(this.combinedBackendCallSubscription){
      this.combinedBackendCallSubscription.unsubscribe();
    }

    this.combinedBackendCallSubscription =  combined.subscribe((latestValues:any) => {

        const [ companyResponse , 
          peersResponse , 
          response4, 
          insightsResponse , 
          newsResponse, 
          responseCandleForTwoYears, 
          recommendationResponse,
          earningsResponse  ] = latestValues;

        if(companyResponse.errorData  && typeof(companyResponse.errorData) === 'string' && companyResponse.errorData.includes('429')){
          
          this.isAPIResponseExeeded = true;

          if(this.isAPIResponseExeededSubscription){
            clearTimeout(this.isAPIResponseExeededSubscription);
          }

          this.isAPIResponseExeededSubscription = setTimeout(() => {this.isAPIResponseExeeded = false}, 5.0*1000);
          
          this.deleteState();
          this.clearResults();

          if(this.quotesSubscription){
            clearInterval(this.quotesSubscription);
          }

          this.router.navigateByUrl(`/search/${this.tickerVal}`);
          throwError("company profile gave error");
          return;
        }
        else if(!companyResponse.ticker){
          // BAD RESULT
          
          this.notValidTicker = true;

          if(this.notValidTickerSubscription){
            clearTimeout(this.notValidTickerSubscription);
          }

          this.notValidTickerSubscription = setTimeout(() => {this.notValidTicker = false}, 5.0*1000);
          
          this.deleteState();
          this.clearResults();

          if(this.quotesSubscription){
            clearInterval(this.quotesSubscription);
          }

          this.router.navigateByUrl(`/search/${this.tickerVal}`);
          throwError("company profile gave error");
          return;
  
        }
        else{
          this.companyProfile = companyResponse;
          this.updateState('companyProfile', {...companyResponse});
          this.updateState('tickerVal', this.tickerVal);
          this.notValidTicker = false;
          this.noTickerEntered = false;
          this._router.navigateByUrl(`/search/${this.tickerVal.toUpperCase()}`);
        }

        this.tickerVal = this.companyProfile.ticker;

        // quotes

        // peers
        const filteredPeers = peersResponse.filter(Boolean);
        this.peers = filteredPeers;
        this.updateState('peers', this.peers);

        // history

        // insights
        this.insightdata = insightsResponse;

        this.allmentions = {};
        this.allmentions.reddit = {};
        this.allmentions.twitter = {};
        this.allmentions.reddit.mention = 0;
        this.allmentions.reddit.posmention = 0;
        this.allmentions.reddit.negmention = 0;
        this.allmentions.twitter.mention = 0;
        this.allmentions.twitter.posmention = 0;
        this.allmentions.twitter.negmention = 0;

        for (let i of this.insightdata.reddit){
          this.allmentions['reddit']['mention']+=parseInt(i.mention)
          this.allmentions['reddit']['posmention']+=parseInt(i.positiveMention)
          this.allmentions['reddit']['negmention']+=parseInt(i.negativeMention)
        }
        for(let i of this.insightdata.twitter){
          this.allmentions['twitter']['mention']+=parseInt(i.mention)
          this.allmentions['twitter']['posmention']+=parseInt(i.positiveMention)
          this.allmentions['twitter']['negmention']+=parseInt(i.negativeMention)
        }

        this.updateState('allmentions', this.allmentions);

        // news
        const today = new Date().toISOString().slice(0, 10);
        const before = this.getPrevDate(1, 0, 0).toISOString().slice(0, 10);

        this.news = newsResponse.slice(0, 20);

        let max_count = 20;
        let result = []
        for(let item of this.news){
          if(item && item.image && item.headline){
            result.push(item);
            max_count--;
          }
          if(max_count == 0) break;
        }

        this.news = result;

        this.updateState('news', this.news);

        // candle for two years
        this.candleForTwoYears = {...responseCandleForTwoYears};
        this.updateState('candleForTwoYears', this.candleForTwoYears);

        // recommendation
        this.recommendation = recommendationResponse;
        this.updateState('recommendation', this.recommendation)

        // earnings
        this.earnings = earningsResponse;
        this.updateState('earnings', this.earnings);

        this.showResults();
        
    }, error => {
      this.clearResults();
    });

  }

  clearAllToasts(){
    this.noTickerEntered = false;
    this.notValidTicker = false;
  }

  showResults(){
    this.showMainPageSpinner = false;
    this.displayResult = true;
  }

  clearResults(){
    this.showMainPageSpinner = false;
    this.displayResult = false;
  }

  fillQuotsDataOnResponse(response:any){
    this.quote = {...response};
    if(!this.quote.c) this.quote.c = 0;
    if(!this.quote.d) this.quote.d = 0;
    if(!this.quote.dp) this.quote.dp = 0;
    if(!this.quote.h) this.quote.h = 0;
    if(!this.quote.l) this.quote.l = 0;
    if(!this.quote.pc) this.quote.pc = 0;
    if(!this.quote.t) this.quote.t = 0;
    if(!this.quote.o) this.quote.o = 0;
    
    let marketOpenFlag = true;

    this.getMarketOpenStatus();
    if (this.isMarketOpen){
      let to = new Date().getTime()
      let from = to - (6*60*60*1000)
      this.companyService.getCompanyHistory(this.tickerVal, '5', Math.floor(from/1000), Math.floor(to/1000)).subscribe((response: any)=>{
        if(response && Object.keys(response).length > 0){  
          this.candle = {...response};
        }else{
          this.candle = {} as any;
        }

        this.updateState('candle', this.candle);
      });
    }
    else{
      let to = new Date(this.quote.t*1000).getTime()
      let from = to - (6*60*60*1000)
      this.companyService.getCompanyHistory(this.tickerVal, '5', Math.floor(from/1000), Math.floor(to/1000)).subscribe((response:any)=>{
        
        if(response && Object.keys(response).length > 0){
          this.candle = {...response};
        }else{
          this.candle = {} as any;
        }

        this.updateState('candle', this.candle);
      });
      marketOpenFlag = false;
    }

    this.stockCurrentTime = new Date();
    this.updateState('quote', this.quote);
    
    return marketOpenFlag;
  }

  getQuotesRepeatedly(){
    
    let observable2 = this.companyService.getCompanyStockPrice(this.tickerVal);

    if(this.quotesSubscription){
      clearInterval(this.quotesSubscription);
    }

    observable2.subscribe((response: any) => {
      let isMarketOpen = this.fillQuotsDataOnResponse(response);
      
      if(isMarketOpen){
        this.quotesSubscription = setInterval(() => {
          this.companyService.getCompanyStockPrice(this.tickerVal).subscribe(response => {
            this.fillQuotsDataOnResponse(response);
          })
        }, 15000);
      }
      else{
        // console.log("Market is closed, not calling in 15s");
      }

    }, (error:any) => {
      console.log("error on get company history: " + error);
    });

    return observable2;
    
  }

  getMarketOpenStatus(): void{
    let diff = Math.abs(new Date().getTime() - new Date(this.quote.t*1000).getTime())
    let minutes = Math.floor(diff/1000)/60

    if(!this.quote || !this.quote.t){
      this.marketMsg = `Market data is not available`;
      this.isMarketOpen = false;
    }
    else if (minutes > 5) {
      setTimeout(()=>{
        this.isMarketOpen = false;
      }, 0)
      let datefill = new Date(this.quote.t*1000)
      this.marketMsg = `Market closed at ${datefill.toISOString().split('T')[0] + ' ' + datefill.toTimeString().split('GMT')[0]}`
    }
    else {
      setTimeout(()=>{
        this.isMarketOpen = true;
      }, 0)
      this.marketMsg = `Market is open`;
    }

  }

  noTickerEnteredSubscription:any;

  getStockSearchResultFromAPI(){
    
    this.tickerVal = this.tickerSymbol;
    this.parseTicker();
    if(this.tickerVal === ''){
      this.noTickerEntered = true;
      if(this.noTickerEnteredSubscription){
        clearTimeout(this.noTickerEnteredSubscription);
      }
      this.noTickerEnteredSubscription = setTimeout(() => {this.noTickerEntered = false}, 5.0*1000);
      this.clearResults();
      this.router.navigateByUrl('/search/home');
      return;
    }

    this.tickerVal = this.tickerVal.toUpperCase();
    this.callBackendAPI();
  }

  getDataFromApiOnAutocomplete(tickerObj: any){
    this.tickerVal = tickerObj.symbol;
    this.callBackendAPI();
  }

  filterAutocompleteResult(value:any){
    return value.type === "Common Stock" && !value.symbol.includes('.');
  }

  autocompleteSubscription:any;

  getDataForAutocomplete(value: any){

    this.tickerVal = value;
    let q = value;
    this.showSpinner = true;
  
    if(this.autocompleteSubscription){
      this.autocompleteSubscription.unsubscribe();
    }

    this.autocompleteSubscription =  this.service.getStockSearchQuery(this.tickerVal.toUpperCase()).subscribe( (response : any) => {
      let res = JSON.parse(JSON.stringify(response));
      let tickerlist = res.result.filter(this.filterAutocompleteResult);
      // tickerlist = tickerlist.slice(0, 4);
      this.options = [];
      for(let ticker of tickerlist){
        this.options.push(ticker);
      }
      this.showSpinner = false;
    });

  }

  noTickerEnteredAltertClosed(){
    this.noTickerEntered = false;
  }

  deleteState(){
    this.state.tickerVal = '';
    this.searchStateService.state$.next(this.state);
  }

  cancelSearch(){
    this.noTickerEntered = false;
    this.notValidTicker = false;
    this.displayResult = false;
    this.tickerVal = '';
    this.tickerSymbol = '';
    this._router.navigateByUrl('/search/home');
    this.deleteState();
  }

  getPrevDate(month:number, day:number, unix:number) {
    var d:any = new Date();
    var m = d.getMonth();
    
    if(month){
      d.setMonth(d.getMonth() - month);
    }
    if(day){
      d.setDate(d.getDate() - day);
    }
    if (unix) {
      return Math.round(d / 1000 | 0);
    }
    else {
      return d;
    }

  }

  keyPress($event:KeyboardEvent){
    if($event.key == '13'){
    }
  }

  childsPeersClicked(ticker:string){
    this.tickerVal = ticker.toUpperCase();
    this.clearResults();
    this.callBackendAPI();
  }

}
