import {Component, input} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatTabsModule} from "@angular/material/tabs";
import {TranslatePipe} from "@ngx-translate/core";
import {ToolConfigsDTO} from "@shared-lib/modules/app-execution/dto/config";
import {
  ToolConfigCardComponent
} from "@shared-lib/modules/store/components/tool-config-card/tool-config-card.component";

@Component({
  selector: 'lib-store-app-config',
  imports: [
    MatIconModule,
    MatTabsModule,
    TranslatePipe,
    ToolConfigCardComponent,
  ],
  templateUrl: './store-app-config.component.html',
  styleUrl: './store-app-config.component.scss'
})
export class StoreAppConfigComponent {
  readonly config = input<ToolConfigsDTO>();
}
