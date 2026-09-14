import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {ActionCardButtonComponent} from "@shared-lib/components/action-card-button/action-card-button.component";

export interface AdminCenterTile {
  id: string;
  title: string;
  description: string;
  icon: string;
  routerLink?: string;
  externalUrl?: string;
  badge?: string;
}

@Component({
  selector: 'lib-admin-center',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HeaderComponent,
    PageWrapperComponent,
    ActionCardButtonComponent,
  ],
  templateUrl: './admin-center.component.html',
  styleUrl: './admin-center.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCenterComponent {
  title = input('Admin Center');
  subtitle = input('Operate platform services, orchestration, and runtime diagnostics from one place.');
  tiles = input.required<AdminCenterTile[]>();
  actionUrl = input<string | null | undefined>();
  actionLabel = input('Open identity admin');
  actionIcon = input('key');

  hasAction = computed(() => !!this.actionUrl());
}
