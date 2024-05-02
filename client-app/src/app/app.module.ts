import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SearchHomeComponent } from './search-home/search-home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { StockPurchaseModalComponent } from './stock-purchase-modal/stock-purchase-modal.component';
import { NewsModalComponent } from './news-modal/news-modal.component'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PriceChartComponent } from './price-chart/price-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { SmaVolumeChartComponent } from './sma-volume-chart/sma-volume-chart.component';
import { RecommendationChartComponent } from './recommendation-chart/recommendation-chart.component';
import { EarningsChartComponent } from './earnings-chart/earnings-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    SearchResultComponent,
    WatchlistComponent,
    PortfolioComponent,
    PageNotFoundComponent,
    SearchHomeComponent,
    StockPurchaseModalComponent,
    NewsModalComponent,
    PriceChartComponent,
    SmaVolumeChartComponent,
    RecommendationChartComponent,
    EarningsChartComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'search',
        component: SearchComponent,
        children: [
          {path: 'home', component: SearchHomeComponent},
          {path: ':ticker', component: SearchResultComponent},
          {path: '', redirectTo: 'home', pathMatch: 'full'},
        ]
      },
      {path: 'watchlist', component: WatchlistComponent},
      {path: 'portfolio', component: PortfolioComponent},
      {path: '', redirectTo: 'search/home', pathMatch: 'full'},
      {path: '**', component: PageNotFoundComponent}
    ]),
    BrowserAnimationsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    HighchartsChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
