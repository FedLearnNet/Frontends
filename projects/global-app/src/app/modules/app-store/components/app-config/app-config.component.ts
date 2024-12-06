import {Component, Input} from '@angular/core';
import {
    AppClientConfigComponent
} from "../../../test-app/components/app-detail-config/components/app-client-config/app-client-config.component";
import {
    AppDetailConfigHyperparamComponent
} from "../../../test-app/components/app-detail-config/components/app-detail-config-hyperparam/app-detail-config-hyperparam.component";
import {
    AppDetailConfigInputComponent
} from "../../../test-app/components/app-detail-config/components/app-detail-config-input/app-detail-config-input.component";
import {
    AppDetailConfigOutputComponent
} from "../../../test-app/components/app-detail-config/components/app-detail-config-output/app-detail-config-output.component";
import {AppEditComponent} from "../../../test-app/components/app-detail-config/components/app-edit/app-edit.component";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatTab, MatTabGroup, MatTabLabel, MatTabsModule} from "@angular/material/tabs";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ConfigDTO} from "../../../test-app/dto/config";

@Component({
  selector: 'app-app-config',
  standalone: true,
    imports: [
        AppClientConfigComponent,
        AppDetailConfigHyperparamComponent,
        AppDetailConfigInputComponent,
        AppDetailConfigOutputComponent,
        AppEditComponent,
        MatIconModule,
      MatTabsModule
    ],
  templateUrl: './app-config.component.html',
  styleUrl: './app-config.component.scss'
})
export class AppConfigComponent {
  @Input() config?: ConfigDTO;
}
