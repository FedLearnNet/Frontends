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
      description: 'Inspect registry images, engine state, running containers, persisted runs, volumes and live runtime logs.',
      icon: 'hub',
      routerLink: '/admin/orch',
      badge: 'Live'
    },
    {
      id: 'executions',
      title: 'Executions',
      description: 'Inspect all execution runs with their steps, attempts, logs, metrics and files.',
      icon: 'play_circle',
      routerLink: '/admin/executions'
    },
    {
      id: 'observer',
      title: 'WebSocket Observer',
      description: 'Monitor live federated learning client connections and inspect sent and received messages.',
      icon: 'monitor_heart',
      routerLink: '/admin/observer',
    },
    {
      id: 'maintenance',
      title: 'Updates & backups',
      description: 'Install another FL-Net version, roll back and back up databases, configuration and secrets.',
      icon: 'system_update_alt',
      routerLink: '/admin/maintenance'
    }
  ]);

  readonly keycloakUrl = environment.keycloak.url || null;
}
