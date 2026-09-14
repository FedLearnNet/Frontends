import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {environment} from '@global-app/env/environment';
import {
  AdminCenterComponent as SharedAdminCenterComponent,
  AdminCenterTile
} from '@shared-lib/modules/admin/components/admin-center/admin-center.component';

@Component({
  selector: 'app-admin-center',
  imports: [
    SharedAdminCenterComponent
  ],
  templateUrl: './admin-center.component.html',
  styleUrl: './admin-center.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCenterComponent {
  readonly tiles = signal<AdminCenterTile[]>([
    {
      id: 'docker',
      title: 'Docker & orchestration',
      description: 'Inspect engine state, running containers, persisted runs, volumes and live runtime logs.',
      icon: 'hub',
      routerLink: '/admin/orch',
      badge: 'Live'
    },
    {
      id: 'observer',
      title: 'WebSocket Observer',
      description: 'Monitor live federated learning client connections and inspect sent and received messages.',
      icon: 'monitor_heart',
      routerLink: '/admin/observer',
    }
  ]);

  readonly keycloakUrl = environment.keycloak.url || null;
}
