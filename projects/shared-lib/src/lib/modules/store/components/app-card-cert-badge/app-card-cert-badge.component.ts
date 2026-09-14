import {Component, computed, input} from '@angular/core';
import {AppDto} from "@shared-lib/modules/store/dto/app";
import {MatIcon} from "@angular/material/icon";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'lib-app-card-cert-badge',
  imports: [
    MatIcon,
    StatusBadgeComponent,
    TranslatePipe,
    MatTooltip
  ],
  templateUrl: './app-card-cert-badge.component.html',
  styleUrl: './app-card-cert-badge.component.scss'
})
export class AppCardCertBadgeComponent {
  app = input.required<AppDto>();

  hasNoCertification = computed(() => !this.app().certificationLevel);
  certificationLevel = computed(() => this.app().certificationLevel);
}
