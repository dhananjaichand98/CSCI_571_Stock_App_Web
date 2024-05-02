import { Component, Input} from '@angular/core';
import { faTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.css']
})
export class NewsModalComponent{

  @Input() newsItem:any = {}
  public faTwitter = faTwitter;
  public faFacebookSquare = faFacebookSquare;
  
  constructor(private activeModal: NgbActiveModal) { }

  getLinkForTwitter(){
    if(this.newsItem.headline && this.newsItem.url){
      return `https://twitter.com/intent/tweet?text=${this.newsItem.headline} - source ${this.newsItem.url}`;
    }
    else{
      return ''
    }
  }

  getLinkForFacebook(){
    if(this.newsItem.url){
      return `https://www.facebook.com/sharer/sharer.php?u=${this.newsItem.url}`;
    }
    else{
      return ''
    }
  }

  formatDate(t: any){
    if(t){
      return dayjs.unix(t).format("MMMM DD, YYYY");
    }
    else{
      return ''
    }
  }

  closeModal(){
    this.activeModal.close();
  }

}
