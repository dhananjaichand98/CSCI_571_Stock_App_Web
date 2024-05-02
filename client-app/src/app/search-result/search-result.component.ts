import { Component, OnInit, Input, OnChanges, SimpleChanges, NgModuleRef } from '@angular/core';
import { CompanyService } from '../company.service';
import { SearchResultStateService } from '../search-result-state.service';
import { Output, EventEmitter } from '@angular/core';
import {StockPurchaseModalComponent} from '../stock-purchase-modal/stock-purchase-modal.component';
import { NewsModalComponent } from '../news-modal/news-modal.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {userStockPurchaseInterface} from '../interface'
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnChanges {

  isFavourite:boolean = false;
  localStorage:any;
  state:any;
  addedOrRemovedWatchlistdMessage:string = '';
  addedToWatchlist:boolean = false;
  removedFromWatchlist:boolean = false;
  addedToWatchlistSubscription:any;
  removedFromWatchlistSubscription:any;
  stockSoldSubscription:any;
  stockBought:boolean = false;
  stockSold:boolean = false;
  stockBoughtOrSoldMessage:string = '';
  stockBoughtSubscription:any;
  readonly WATCHLIST:string = 'userWatchlist';
  @Output() newSearchEvent = new EventEmitter<string>();
  @Output() peersClickedEmitter = new EventEmitter<string>();
  @Input() inputText:string = '';
  @Input() companyProfile:any;
  @Input() quote:any;
  @Input() peers:any = [];
  @Input() news:any = [];
  @Input() candle:any;
  @Input() stockCurrentTime:any;
  @Input() isMarketOpen:any;
  @Input() marketMsg:any;
  @Input() allmention:any;
  @Input() priceChange:number = 0;
  @Input() candleForTwoYears:any;
  @Input() recommendation:any;
  @Input() earnings:any;
  
  constructor(
    private companyService: CompanyService, 
    private searchResultStateService: SearchResultStateService, 
    private modalService: NgbModal,
    public storageService:LocalStorageService) { 
    this.localStorage = window.localStorage;
  }

  public get positiveChange(){
    return this.quote.dp > 0 ? 'green': this.quote.dp < 0 ? 'red' : 'black';
  }

  ngOnChanges(changes: any): void { 
      
    if(changes['companyProfile']) {
      try{
        if(this.companyProfile.ticker in JSON.parse(this.localStorage.getItem(this.WATCHLIST))){
          this.isFavourite = true;
        }
        else{
          this.isFavourite = false;
        }
      }
      catch(error){
        // console.log("localstorage: " + this.localStorage.getItem(this.WATCHLIST));
      }
    }      

    if(changes['quote']) {  }
    if(changes['peers']) {  }
    if(changes['news']) {  }
    if(changes['candle']) {  }
    if(changes['allmention']){  }

  }
  
  ngOnInit(): void {

    try{
      if(this.companyProfile.ticker in JSON.parse(this.localStorage.getItem(this.WATCHLIST))){
        this.isFavourite = true;
      }
    }
    catch(error){
      console.log("error while getting tickerval from local storage OnInit");
    }

  }

  updateState(name:string, val:any) {
    this.state[name] = val;
    this.searchResultStateService.state$.next(this.state);
  }

  openNewsModal(newsItem:any): void{
    const modalRef = this.modalService.open(NewsModalComponent);
    modalRef.componentInstance.newsItem = newsItem;
  }

  favouriteClicked(){

    let currWatchlist = this.localStorage.getItem(this.WATCHLIST);

    if(!currWatchlist || JSON.stringify(currWatchlist) == '"{}"'){
      currWatchlist = {};
    }
    else{
      try{
        currWatchlist = JSON.parse(currWatchlist);
      }
      catch(error){
        console.log("error in parsing watchlist")
        this.localStorage.removeItem(this.WATCHLIST);
        currWatchlist = {};
      }
      
    }

    let toStoreObj = {
      'ticker': this.companyProfile.ticker,
      'name': this.companyProfile.name,
      'c': this.quote.c,
      'd': this.quote.d,
      'dp': this.quote.dp,
      'priceChange': this.priceChange
    }

    currWatchlist[this.companyProfile.ticker] = toStoreObj;

    this.removedFromWatchlist = false;
    this.addedToWatchlist = true;
    this.addedOrRemovedWatchlistdMessage = `${this.companyProfile.ticker} added to Watchlist.`;
    
    if(this.addedToWatchlistSubscription){
      clearTimeout(this.addedToWatchlistSubscription);
    }

    this.addedToWatchlistSubscription =  setTimeout(() => {
      this.addedToWatchlist = false;
    }, 5*1000.0);

    this.localStorage.setItem(this.WATCHLIST, JSON.stringify(currWatchlist));
    this.isFavourite = true;
  }

  unFavouriteClicked(){

    let currWatchlist = JSON.parse(this.localStorage.getItem(this.WATCHLIST));
    delete currWatchlist[this.companyProfile.ticker];
    this.isFavourite = false;
    this.localStorage.setItem(this.WATCHLIST, JSON.stringify(currWatchlist));
    this.addedToWatchlist = false;
    this.removedFromWatchlist = true;
    this.addedOrRemovedWatchlistdMessage = `${this.companyProfile.ticker} removed from Watchlist.`;
    
    if(this.removedFromWatchlistSubscription){
      clearTimeout(this.removedFromWatchlistSubscription);
    }
    
    this.removedFromWatchlistSubscription = setTimeout(() => {
      this.removedFromWatchlist = false;
    }, 5*1000.0);

  }

  closeWatchlist(){
    this.addedToWatchlist = false;
    this.removedFromWatchlist = false;
  }

  closeBoughtOrSold(){
    this.stockBought = false;
    this.stockSold = false;    
  }

  openStockPurchaseModal() {
    const modalRef = this.modalService.open(StockPurchaseModalComponent);
    modalRef.componentInstance.userRequest = <userStockPurchaseInterface> {
      isBuy: true,
      ticker: this.companyProfile.ticker,
      currPrice: parseFloat(this.quote.c),
      name: this.companyProfile.name
    }
    
    modalRef.componentInstance.stockBought.subscribe((ticker:string) => {
      this.stockBoughtOrSoldMessage = `${ticker} bought successfully.`;
      this.stockSold = false;
      this.stockBought  = true;

      if(this.stockBoughtSubscription){
        clearTimeout(this.stockBoughtSubscription);
      }

      this.stockBoughtSubscription = setTimeout(()=>{
        this.stockBought  = false;
      }, 5*1000.0);
      modalRef.close();

    })

  }

  openStockSellModal(){
    const modalRef = this.modalService.open(StockPurchaseModalComponent);
    modalRef.componentInstance.userRequest = <userStockPurchaseInterface> {
      isBuy: false,
      ticker: this.companyProfile.ticker,
      currPrice: parseFloat(this.quote.c),
      name: this.companyProfile.name
    }

    modalRef.componentInstance.stockSold.subscribe((ticker:string) => {
      this.stockBoughtOrSoldMessage = `${ticker} sold successfully.`;
      this.stockBought  = false;
      this.stockSold  = true;
      
      if(this.stockSoldSubscription){
        clearTimeout(this.stockSoldSubscription);
      }

      this.stockSoldSubscription =  setTimeout(()=>{
        this.stockSold  = false;
      }, 5*1000.0);
      modalRef.close();
    })

  }

  isStockBought():boolean{

    let protfolio = this.storageService.getUserPortfolio();
    return this.companyProfile && this.companyProfile.ticker && this.companyProfile.ticker.toUpperCase() in protfolio;

  }

  peersClicked(ticker:string){
    this.peersClickedEmitter.emit(ticker);
  }

}
