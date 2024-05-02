import {zip, Observable} from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../company.service';
import {StockPurchaseModalComponent} from '../stock-purchase-modal/stock-purchase-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { QuoteInterface, userStockPurchaseInterface} from '../interface';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  isPortfolioEmpty = false;
  groupedResponse = [] as Observable<QuoteInterface>[];
  walletAmount !: string;
  showLoader = false;
  stockBought:boolean = false;
  stockSold:boolean = false;
  stockBoughtOrSoldMessage:string = '';
  stockBoughtSubscription:any;
  stockSoldSubscription:any;
  portfolioDetails : any = [];
  
  constructor(
    private _storageService: LocalStorageService,
    private _companyService: CompanyService, 
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.updateProtfolio();
  }

  updateProtfolio(){

    this.portfolioDetails = Object.values(this._storageService.getUserPortfolio());
    this.walletAmount = this._storageService.getUserMoney().toString();
    this.isPortfolioEmpty = this.portfolioDetails.length > 0 ? false: true;
    this.showLoader = true;

    this.groupedResponse = this.portfolioDetails.map((ele: any) => {
      return this._companyService.getCompanyStockPrice(ele.ticker);
    });

    zip(this.groupedResponse).subscribe((responses)=>{

      this.portfolioDetails =  this.portfolioDetails.map((data: any, ind: number) => {
        data['costPerShare'] = data.totalCost/data.quantity;
        data['currPrice'] = responses[ind].c;
        data['change'] = parseFloat((data['currPrice'] - data['costPerShare']).toFixed(2));
        data['marketValue'] = parseFloat((responses[ind].c * data['quantity']).toFixed(2));
        return data;
      })
      this.showLoader = false;

    });

  }

  changeNumberDisplay(val: any){
    if(typeof(val) === "number"){
      return val.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
    else{
      return ""
    }
  }

  showCaretUp(val: any){
    return val > 0 ? "inline-flex" : "none";
  }

  showCaretDown(val: any){
    return val < 0 ? "inline-flex" : "none";
  }

  getColor(val: any){
    return val < 0 ? "red" : val > 0 ? "green" : "black";
  }

  openStockPurchaseModal(data:any, i:any) {
    const modalRef = this.modalService.open(StockPurchaseModalComponent);
    modalRef.componentInstance.userRequest = <userStockPurchaseInterface> {
      isBuy: true,
      ticker: data.ticker,
      currPrice: parseFloat(data['currPrice']),
      name: data.name
    }
    
    modalRef.componentInstance.stockBought.subscribe((ticker:string) => {
      this.stockBoughtOrSoldMessage = `${ticker} bought successfully.`;
      this.stockSold = false;
      this.stockBought  = true;

      if(this.stockBoughtSubscription){
        clearTimeout(this.stockBoughtSubscription)
      }

      this.stockBoughtSubscription = setTimeout(()=>{
        this.stockBought  = false;
      }, 5*1000.0);
      modalRef.close();
      this.updateProtfolio();

    })

  }

  openStockSellModal(data:any, i:number){
    const modalRef = this.modalService.open(StockPurchaseModalComponent);
    modalRef.componentInstance.userRequest = <userStockPurchaseInterface> {
      isBuy: false,
      ticker: data.ticker,
      currPrice: parseFloat(data['currPrice']),
      name: data.name
    }

    modalRef.componentInstance.stockSold.subscribe((ticker:string) => {
      this.stockBoughtOrSoldMessage = `${ticker} sold successfully.`;
      this.stockBought = false;
      this.stockSold  = true;

      if(this.stockSoldSubscription){
        clearTimeout(this.stockSoldSubscription);
      }

      this.stockSoldSubscription = setTimeout(()=>{
        this.stockSold  = false;
      }, 5*1000.0);
      modalRef.close();
      this.updateProtfolio();

    })
  }

  closeBoughtOrSold(){
    this.stockBought = false;
    this.stockSold = false;    
  }

}
