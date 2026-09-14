import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {AppDto} from "@shared-lib/modules/store/dto/app";
import {RouterLink} from "@angular/router";
import {ModelDto} from "@shared-lib/modules/app-execution/dto/model";
import {PlaceholderImageComponent} from "@shared-lib/components/placeholder-image/placeholder-image.component";

@Component({
  selector: 'app-model-card',
  imports: [
    MatCardModule,
    RouterLink,
    PlaceholderImageComponent
  ],
  templateUrl: './model-card.component.html',
  styleUrl: './model-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelCardComponent {
  routeOnClick = input<boolean>(true);
  model = input.required<ModelDto>()

  get relatedApp(): AppDto {
    return this.model().federatedApp;
  }

}
