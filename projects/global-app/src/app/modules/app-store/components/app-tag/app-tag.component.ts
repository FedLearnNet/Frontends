import {Component, Input} from '@angular/core';
import {AppDto} from "../../dto/app";
import {MatButtonModule} from "@angular/material/button";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {PublishStatus} from "@global-app/app-store/dto/enum";

@Component({
  selector: 'app-app-tags',
  standalone: true,
  imports: [MatButtonModule, MatChipsModule, MatIconModule, MatTooltipModule],
  templateUrl: './app-tag.component.html',
  styleUrl: './app-tag.component.scss'
})
export class AppTagComponent {
  @Input() app: AppDto;


    protected readonly PublishStatus = PublishStatus;
}
