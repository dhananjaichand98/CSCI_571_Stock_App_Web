import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {

  constructor() { }

  state$ = new BehaviorSubject<any>(null);

}
