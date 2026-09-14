import {Component, computed, input} from '@angular/core';
import {FLNetParticipantRole} from "../../../../../global-app/src/app/modules/tool-development/dto/federated-test-run";
import {BadgeSize} from "@shared-lib/components/badge/badge.component";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'lib-federated-client-type-badge',
  imports: [
    MatIcon
  ],
  templateUrl: './federated-client-type-badge.component.html',
  styleUrl: './federated-client-type-badge.component.scss',
})
export class FederatedClientTypeBadgeComponent {
  clientType = input.required<FLNetParticipantRole>();

  clientName = input<string>();

  size = input<BadgeSize>('SMALL');
  border = input<boolean>(false);

  iconName = computed(() => this.clientType() === FLNetParticipantRole.AGGREGATOR ? 'hub' : 'devices');

  formattedText = computed(() => this.clientType().charAt(0).toUpperCase() + this.clientType().slice(1).toLowerCase());
  displayName = computed(() => this.clientName()?.trim() ?? '');
  hasClientName = computed(() => this.displayName().length > 0);


  className = computed(() =>
    `badge ${this.size().toLowerCase()}
    ${this.clientType()?.toLowerCase()}
    ${this.border() ? 'border' : ''}
    ${this.hasClientName() ? 'has-name' : ''}`
  );
}
