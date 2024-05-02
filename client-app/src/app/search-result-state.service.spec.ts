import { TestBed } from '@angular/core/testing';

import { SearchResultStateService } from './search-result-state.service';

describe('SearchResultStateService', () => {
  let service: SearchResultStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchResultStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
