import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AdminDockerDashboardComponent as SharedAdminDockerDashboardComponent} from '@shared-lib/modules/admin/components/admin-docker-dashboard/admin-docker-dashboard.component';

@Component({
  selector: 'app-admin-docker-dashboard',
  imports: [
    SharedAdminDockerDashboardComponent
  ],
  templateUrl: './admin-docker-dashboard.component.html',
  styleUrl: './admin-docker-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDockerDashboardComponent {
}
