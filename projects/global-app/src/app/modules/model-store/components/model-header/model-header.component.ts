import {Component, Input} from '@angular/core';
import {AppTagComponent} from "@global-app/app-store/components/app-tag/app-tag.component";
import {DatePipe} from "@angular/common";
import {MatAnchor} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {UserLinkComponent} from "../../../user/components/user-link/user-link.component";
import {ModelDetailDto} from "@global-app/model-store/dto/model";

@Component({
  selector: 'app-model-header',
  standalone: true,
    imports: [
        AppTagComponent,
        DatePipe,
        MatAnchor,
        MatIcon,
        UserLinkComponent
    ],
  templateUrl: './model-header.component.html',
  styleUrl: './model-header.component.scss'
})
export class ModelHeaderComponent {

  @Input() model: ModelDetailDto;
}
