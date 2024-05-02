import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  
  public url = 'https://stocks-app-angular-node.wl.r.appspot.com';

  constructor(private http: HttpClient) { }

  getCompanyProfile(tickerSymbol:string){
    // this will return an observable to which we will subscribe
    return this.http.get(`${this.url}/company-description`, {
      params:{
        'symbol': tickerSymbol
      }
    });
  }

  getCompanyHistory(tickerSymbol:string, resolution: string, from: any, to: any){
    return this.http.get(`${this.url}/company-history`, {
      params:{
        'symbol': tickerSymbol,
        'resolution': resolution,
        'from': from,
        'to': to 
      }
    });
  }

  getCompanyStockPrice(tickerSymbol:string){
    return this.http.get(`${this.url}/company-stock-price`, {
      params:{
        'symbol': tickerSymbol
      }
    });
  }

  getCompanySymbolQuery(q:string){
    return this.http.get(`${this.url}/company-symbol-query`, {
      params:{
        'q': q
      }
    });
  }

  getCompanyNews(tickerSymbol:string, from: any, to: any){
    return this.http.get(`${this.url}/company-news`, {
      params:{
        'symbol': tickerSymbol,
        'from': from,
        'to': to
      }
    });
  }

  getCompanyRecommendationTrends(tickerSymbol:string){
    return this.http.get(`${this.url}/company-recommendation-trends`, {
      params:{
        'symbol': tickerSymbol
      }
    });
  }

  getCompanySocialSentiment(tickerSymbol:string, from:any){
    return this.http.get(`${this.url}/company-social-sentiment`, {
      params:{
        'symbol': tickerSymbol,
        'from': from
      }
    });
  }

  getCompanyPeers(tickerSymbol:string){
    return this.http.get(`${this.url}/company-peers`, {
      params:{
        'symbol': tickerSymbol
      }
    });
  }

  getCompanyEarning(tickerSymbol:string){
    return this.http.get(`${this.url}/company-earnings`, {
      params:{
        'symbol': tickerSymbol
      }
    });
  }

}
