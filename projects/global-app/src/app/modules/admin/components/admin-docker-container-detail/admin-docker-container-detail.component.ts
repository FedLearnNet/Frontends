import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {
  AdminDockerContainerDetailPageComponent
} from '@shared-lib/modules/admin/components/admin-docker-container-detail-page/admin-docker-container-detail-page.component';

@Component({
  selector: 'app-admin-docker-container-detail',
  imports: [
    AdminDockerContainerDetailPageComponent
  ],
  templateUrl: './admin-docker-container-detail.component.html',
  styleUrl: './admin-docker-container-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDockerContainerDetailComponent {
  readonly containerId = input.required<string>();
}
