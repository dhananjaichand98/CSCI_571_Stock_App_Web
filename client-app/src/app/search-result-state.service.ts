import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchResultStateService {

  constructor() { }

  state$ = new BehaviorSubject<any>(null);

}
