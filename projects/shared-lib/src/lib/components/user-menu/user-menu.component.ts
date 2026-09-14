import {Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import Keycloak from "keycloak-js";
import {MatButton} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {BadgeColor, BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {getKeycloakRedirectUri} from "@shared-lib/services/keycloak";

@Component({
  selector: 'app-lib-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
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
  private readonly keycloak = inject(Keycloak, {optional: true});
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
    void this.keycloak?.login();
  }

  public accountManagement() {
    void this.keycloak?.accountManagement();
  }

  public logout() {
    void this.keycloak?.logout({redirectUri: getKeycloakRedirectUri()});
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
