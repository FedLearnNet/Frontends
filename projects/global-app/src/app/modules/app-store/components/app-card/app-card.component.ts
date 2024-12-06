import {Component, Input} from '@angular/core';
import {AppDto} from "../../dto/app";
import {Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-app-card',
  templateUrl: './app-card.component.html',
  styleUrl: './app-card.component.scss'
})
export class AppCardComponent {

  @Input() app: AppDto;
  @Input() linkToShop: boolean = false;

  @Output() itemClicked = new EventEmitter<AppDto>();


  public itemClick() {
    if (this.linkToShop) {
      return;
    }
    this.itemClicked.emit(this.app);
  }

}
