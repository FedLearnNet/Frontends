import {Component, computed, input} from '@angular/core';
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {MatIcon} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  ToolConfigCardComponent
} from "@shared-lib/modules/store/components/tool-config-card/tool-config-card.component";


@Component({
  selector: 'lib-tool-io-graph',
  standalone: true,
  imports: [
    MatIcon,
    BadgeComponent,
    ToolConfigCardComponent
  ],
  templateUrl: './tool-io-graph.component.html',
  styleUrl: './tool-io-graph.component.scss',
})
export class ToolIoGraphComponent {
  app = input.required<AppDetailDto>();

  config = computed(() => this.app()?.appConfig ?? null);

  toolLabel = computed(() => {
    const a: any = this.app();
    return a?.name?.trim() || a?.uniqueAppId?.trim() || a?.slug?.trim() || 'Tool';
  });

  inputs = computed(() => this.config()?.input ?? []);
  outputs = computed(() => this.config()?.output ?? []);
  hyperparams = computed(() => this.config()?.hyperparams ?? []);
}
