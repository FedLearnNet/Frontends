import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {TranslatePipe} from "@ngx-translate/core";
import {hasNetworkAccess, NetworkAccess} from "@shared-lib/modules/store/model/network-access";

/**
 * Warns that tools about to run or be accepted reach the internet or the host system.
 * Renders nothing when no tool needs either.
 */
@Component({
  selector: 'lib-network-access-warning',
  imports: [MatIcon, TranslatePipe],
  templateUrl: './network-access-warning.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './network-access-warning.component.scss'
})
export class NetworkAccessWarningComponent {
  access = input.required<NetworkAccess>();

  readonly visible = computed(() => hasNetworkAccess(this.access()));
  readonly internetTools = computed(() => this.access().internetTools.join(', '));
  readonly hostTools = computed(() => this.access().hostTools.join(', '));
}
