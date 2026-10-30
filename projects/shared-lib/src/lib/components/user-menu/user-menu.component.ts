import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {BadgeColor, BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {login, logout} from "@shared-lib/services/auth";
import {getAccountManagementUrl} from "@shared-lib/services/auth.helper";

@Component({
  selector: 'app-lib-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BadgeComponent,
    MatIcon,
    MatMenuModule,
    MatButton,
    TranslatePipe,
    KvComponent
  ]
})
export class UserMenuComponent {
  private readonly authState = inject(AuthStateService);

  readonly isLoggedIn = this.authState.isLoggedIn;
  readonly userProfile = this.authState.userProfile;
  readonly userRoles = this.authState.userRoles;
  readonly isAdmin = this.authState.isAdmin;
  readonly statusKey = this.authState.statusKey;

  readonly displayName = computed(() => {
    const profile = this.userProfile();

    return profile?.firstName
      || profile?.username
      || 'Guest';
  });

  readonly fullName = computed(() => {
    const profile = this.userProfile();
    const fullName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || profile?.username || 'Guest';
  });

  readonly initials = computed(() => {
    const source = this.fullName();
    const parts = source.split(/\s+/).filter(Boolean);

    return parts
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'G';
  });

  public login() {
    login();
  }

  public accountManagement() {
    window.location.assign(getAccountManagementUrl());
  }

  public logout() {
    logout();
  }

  public isAdminRole(role: string): boolean {
    const normalizedRole = role.toLowerCase();
    return normalizedRole === 'admin' || normalizedRole.endsWith(':admin');
  }

  public getStatusBadgeColor(): BadgeColor {
    if (!this.isLoggedIn()) {
      return 'GRAY';
    }

    return this.isAdmin() ? 'GREEN' : 'BLUE';
  }

  public getVerificationBadgeColor(): BadgeColor {
    return this.userProfile()?.emailVerified ? 'GREEN' : 'ORANGE';
  }

  public getRoleBadgeColor(role: string): BadgeColor {
    return this.isAdminRole(role) ? 'GREEN' : 'GRAY';
  }
}
