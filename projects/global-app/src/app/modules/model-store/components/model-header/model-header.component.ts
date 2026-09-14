import {Component, input} from '@angular/core';
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {TranslatePipe} from "@ngx-translate/core";
import {PlaceholderImageComponent} from "@shared-lib/components/placeholder-image/placeholder-image.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {DockerImageTagComponent} from "@shared-lib/components/docker-image-tag/docker-image-tag.component";


@Component({
  selector: 'app-model-header',
  imports: [
    TranslatePipe,
    PlaceholderImageComponent,
    KvComponent,
    DockerImageTagComponent,
  ],
  templateUrl: './model-header.component.html',
  styleUrl: './model-header.component.scss'
})
export class ModelHeaderComponent {
  model = input.required<ModelDetailDto>()
}
