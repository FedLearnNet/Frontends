import {Component, computed, input} from '@angular/core';
import {PublishBadeType, PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {TranslatePipe} from "@ngx-translate/core";
import {AppDto} from "@shared-lib/modules/store/dto/app";
import {MatTooltip} from "@angular/material/tooltip";
import {
  AppCardCertBadgeComponent
} from "@shared-lib/modules/store/components/app-card-cert-badge/app-card-cert-badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

@Component({
  selector: 'lib-app-card-tags',
  imports: [
    PublishBadgeComponent,
    TranslatePipe,
    MatTooltip,
    AppCardCertBadgeComponent,
    StatusBadgeComponent,
    BadgeComponent
  ],
  templateUrl: './app-card-tags.component.html',
  styleUrl: './app-card-tags.component.scss'
})
export class AppCardTagsComponent {
  app = input.required<AppDto>();
  onlyTags = input<boolean>(false);
  showPublish = input<boolean>(false);


  publishStatus = computed(() => this.app().publishStatus as PublishBadeType)

}
