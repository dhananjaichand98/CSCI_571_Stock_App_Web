import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  public url = 'https://stocks-app-angular-node.wl.r.appspot.com';

  getStockSearchQuery(q:string){
    return this.http.get(`${this.url}/company-symbol-query`, {
      params:{
        'q': q
      }
    });
  }

}
