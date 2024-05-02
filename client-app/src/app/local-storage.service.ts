import { Injectable } from '@angular/core';
import {PortfolioItemInterface, PortfolioInterface} from './interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private _localStorage:Storage;
  readonly MONEY:string = 'userMoney';
  readonly PORTFOLIO:string = 'userPortfolio';
  userMoney:number = 0;
  userPortfolio!:PortfolioInterface;

  constructor() { 
    this._localStorage = window.localStorage;

    // money
    let currMoney = this._localStorage.getItem(this.MONEY);
    if(!currMoney || parseFloat(currMoney) == NaN){
      this.userMoney = 25000;
    }
    else{
      this.userMoney = parseFloat(currMoney);
    }

    // portfolio
    let currPortfolio = this._localStorage.getItem(this.PORTFOLIO);

    try{
      
      if(!currPortfolio){
        this.userPortfolio = <PortfolioInterface>{};
      }
      else{
        this.userPortfolio = <PortfolioInterface>JSON.parse(currPortfolio);
      }
      
    }
    catch(error){
      this.userPortfolio = <PortfolioInterface>{};
    }

  }

  getUserMoney():number{
    return parseFloat(this.userMoney.toFixed(2))
  }

  getUserPortfolio():PortfolioInterface{
    return this.userPortfolio;
  }

  updateUserMoney(newMoney:number){

    this._localStorage.setItem(this.MONEY, newMoney.toFixed(2));
    this.userMoney = parseFloat(newMoney.toFixed(2));

  }

  addToPortfolio(ticker:string, update:PortfolioItemInterface){

    if(ticker in this.userPortfolio){
      let userPortfolioItem = this.userPortfolio[ticker];
      let newQuantity = userPortfolioItem.quantity + update.quantity;
      let newTotalCost = userPortfolioItem.totalCost + update.totalCost;
      this.userPortfolio[ticker].quantity = newQuantity;
      this.userPortfolio[ticker].totalCost = newTotalCost;
      this.userPortfolio[ticker].ticker = userPortfolioItem.ticker;
      this.userPortfolio[ticker].name = userPortfolioItem.name;
    }
    else{
      this.userPortfolio[ticker] = <PortfolioItemInterface>update;
    }

    this._localStorage.setItem(this.PORTFOLIO, JSON.stringify(this.userPortfolio));

  }

  sellFromPortfolio(ticker:string, update:PortfolioItemInterface){
    if(ticker in this.userPortfolio){
      let userPortfolioItem = this.userPortfolio[ticker];
      let newQuantity = userPortfolioItem.quantity - update.quantity;
      let newTotalCost = userPortfolioItem.totalCost - update.quantity*(userPortfolioItem.totalCost/userPortfolioItem.quantity);

      if(newQuantity == 0){
        delete this.userPortfolio[ticker];
      }
      else{
        this.userPortfolio[ticker].quantity = newQuantity;
        this.userPortfolio[ticker].totalCost = newTotalCost;
        this.userPortfolio[ticker].ticker = userPortfolioItem.ticker;
        this.userPortfolio[ticker].name = userPortfolioItem.name;
      }

    }
    else{
      console.log("sellFromPortfolio(): SOLD STOCK NOT PURCHASED, THIS SHOULDN'T HAVE HAPPENED")
    }

    this._localStorage.setItem(this.PORTFOLIO, JSON.stringify(this.userPortfolio));

  }

}
