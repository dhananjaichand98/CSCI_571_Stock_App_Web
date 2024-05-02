import { Component, Input, OnInit } from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageService } from '../local-storage.service';
import { FormControl } from '@angular/forms';
import {PortfolioItemInterface, PortfolioInterface} from '../interface';
import { Output, EventEmitter } from '@angular/core';
import {userStockPurchaseInterface} from '../interface'

@Component({
  selector: 'app-stock-purchase-modal',
  template: `
    <div class="modal-header">
      <h1 class="modal-title">{{userRequest.ticker}}</h1>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <div>Current Price: {{userRequest.currPrice}}</div>
      <div>Money in Wallet: {{'$' + moneyInWallet}}</div>
      <div>
        <label for="money-input" class="form-label">Quantity:</label>
        <form action="" style="display:inline-block">
          <input \
            id="money-input" 
            type="number" 
            class="form-control m-2" 
            style="display:inline-block" 
            [formControl]="spModalFormControl" 
            >
        </form>  
      </div>
      <div *ngIf="userRequest.isBuy && isBuyingWarning()" class="text-danger">
        Not enough money in wallet!
      </div>
      <div *ngIf="!userRequest.isBuy && isSellingWarning()" class="text-danger">
        You cannot sell the stocks that you don't have!
      </div>
      
    </div>
    <div class="modal-footer justify-content-between d-flex">
      <span class="d-flex alig-items-start">
        Total: {{currTotalCost}}
      </span>
      <button 
        *ngIf="userRequest.isBuy" 
        type="button" 
        [class]="isInvalidBuyAmount()  ? ' btn btn-success disabled' : 'btn btn-success' " 
        (click)="buyStock()">
        Buy
      </button>
      
      <button 
        *ngIf="!userRequest.isBuy" 
        type="button" 
        [class]="isInvalidSellAmount()  ? ' btn btn-success disabled' : 'btn btn-success' "
        (click)="sellStock()">
        Sell
      </button>
    </div>
  `,
  styleUrls: ['./stock-purchase-modal.component.css']
})
export class StockPurchaseModalComponent implements OnInit {

  @Input() userRequest:userStockPurchaseInterface;
  public moneyInWallet:number;
  public amountEntered:number = 0;
  public currTotalCost:number = 0;
  public amountInPortfolio:number = 0;
  public displayWarning:boolean = false;
  @Output() stockBought = new EventEmitter<string>();
  @Output() stockSold = new EventEmitter<string>();

  constructor(public activeModal: NgbActiveModal, public storageService:LocalStorageService) {    
    this.moneyInWallet = storageService.getUserMoney();
    this.userRequest = <userStockPurchaseInterface>{
      ticker: '',
      isBuy: true,
      currPrice: 0,
      name: ''
    };
    
  }

  spModalFormControl = new FormControl();

  ngOnInit(): void {
    if(this.storageService.getUserPortfolio()[this.userRequest.ticker.toUpperCase()]){
      this.amountInPortfolio = this.storageService.getUserPortfolio()[this.userRequest.ticker.toUpperCase()].quantity;
    }
    else{
      this.amountInPortfolio = 0;
    }

    this.spModalFormControl.valueChanges.subscribe(value => {
      this.amountEntered = parseInt(value); 
      if(!this.amountEntered){
        this.currTotalCost = 0;
      }
      else{
        this.currTotalCost = this.amountEntered * this.userRequest.currPrice;
        this.currTotalCost = parseFloat(this.currTotalCost.toFixed(2));
      }      
    });

  }

  isInvalidBuyAmount() :boolean{
    return !this.amountEntered || this.amountEntered < 0 || !this.currTotalCost || this.currTotalCost > this.moneyInWallet;
  }

  isInvalidSellAmount() :boolean{
    return !this.amountEntered || this.amountEntered <= 0 || this.amountEntered > this.amountInPortfolio;
  }

  isBuyingWarning() :boolean{
    return this.currTotalCost as any && this.currTotalCost > this.moneyInWallet;
  }

  isSellingWarning() :boolean{
    return this.amountEntered as any && this.amountEntered > 0 &&  this.amountEntered > this.amountInPortfolio;
  }

  // send alert and close modal
  buyStock(){
    let moneyLeft:number = this.moneyInWallet - this.currTotalCost;

    let updatedPortfolio:PortfolioItemInterface = <PortfolioItemInterface>{
      quantity : this.amountEntered,
      totalCost: this.currTotalCost,
      ticker: this.userRequest.ticker,
      name: this.userRequest.name,
    };

    this.storageService.updateUserMoney(moneyLeft);
    this.storageService.addToPortfolio(this.userRequest.ticker.toUpperCase(), updatedPortfolio);

    // Emmit sold event here
    this.stockBought.emit(this.userRequest.ticker);
  
  }

  sellStock(){
    let newMoney:number = this.moneyInWallet + this.currTotalCost;

    let updatedPortfolio:PortfolioItemInterface = <PortfolioItemInterface>{
      quantity : this.amountEntered,
      totalCost: this.currTotalCost,
      ticker: this.userRequest.ticker,
      name: this.userRequest.name
    };

    this.storageService.updateUserMoney(newMoney);
    this.storageService.sellFromPortfolio(this.userRequest.ticker.toUpperCase(), updatedPortfolio);

    this.stockSold.emit(this.userRequest.ticker);
  }
  
}