import {Component, Input, OnInit} from '@angular/core';
import {AppTagComponent} from "@global-app/app-store/components/app-tag/app-tag.component";
import {MatCard, MatCardContent, MatCardFooter, MatCardModule} from "@angular/material/card";
import {AppDto} from "@global-app/app-store/dto/app";
import {RouterLink} from "@angular/router";
import {ModelDto} from "@global-app/model-store/dto/model";

@Component({
  selector: 'app-model-card',
  standalone: true,
  imports: [
    AppTagComponent,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './model-card.component.html',
  styleUrl: './model-card.component.scss'
})
export class ModelCardComponent implements OnInit{
  @Input() model: ModelDto;

  relatedApp: AppDto;

  ngOnInit(): void {
    this.relatedApp = this.model.federatedApp;
  }


}
