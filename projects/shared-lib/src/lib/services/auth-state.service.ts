import {computed, effect, inject, Injectable, signal} from "@angular/core";
import {KEYCLOAK_EVENT_SIGNAL, KeycloakEventType} from "keycloak-angular";
import Keycloak, {KeycloakProfile} from "keycloak-js";
import {ADMIN_REALM_ROLE, AUDITOR_REALM_ROLE} from "@shared-lib/services/keycloak";

const VISIBLE_USER_ROLES = [ADMIN_REALM_ROLE];
const normalizeRole = (role: string): string => role.toLowerCase();
const matchesRole = (actualRole: string, requiredRole: string): boolean =>
  normalizeRole(actualRole) === normalizeRole(requiredRole);

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly keycloak = inject(Keycloak, {optional: true});
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, {optional: true});

  readonly isLoggedIn = signal<boolean>(!!this.keycloak?.authenticated);
  readonly userProfile = signal<KeycloakProfile | null>(null);
  readonly userRoles = signal<string[]>([]);
  readonly isAdmin = signal<boolean>(this.hasRole(ADMIN_REALM_ROLE));
  readonly isAuditor = signal<boolean>(this.hasRole(AUDITOR_REALM_ROLE));

  readonly statusKey = computed(() => {
    if (!this.isLoggedIn()) {
      return 'GUEST';
    }

    if(this.isAuditor()) {
      return 'USER';
    }
    return this.isAdmin() ? 'MENU.ADMIN' : 'USER';
  });

  constructor() {
    if (!this.keycloak || !this.keycloakSignal) {
      return;
    }

    effect(() => {
      const keycloakEvent = this.keycloakSignal!();

      switch (keycloakEvent.type) {
        case KeycloakEventType.Ready:
        case KeycloakEventType.AuthSuccess:
        case KeycloakEventType.AuthRefreshSuccess:
          void this.refreshState();
          break;
        case KeycloakEventType.AuthLogout:
        case KeycloakEventType.AuthRefreshError:
        case KeycloakEventType.AuthError:
          this.resetState();
          break;
        default:
          break;
      }
    });

    if (this.keycloak.authenticated) {
      void this.refreshState();
    }
  }

  private async refreshState(): Promise<void> {
    if (!this.keycloak) {
      this.resetState();
      return;
    }

    const isLoggedIn = !!this.keycloak.authenticated;
    this.isLoggedIn.set(isLoggedIn);
    this.isAdmin.set(isLoggedIn && this.hasRole(ADMIN_REALM_ROLE));
    this.isAuditor.set(isLoggedIn && this.hasRole(AUDITOR_REALM_ROLE));

    if (!isLoggedIn) {
      this.userProfile.set(null);
      this.userRoles.set([]);
      return;
    }

    try {
      this.userProfile.set(await this.keycloak.loadUserProfile());
    } catch {
      this.userProfile.set(null);
    }

    this.userRoles.set(this.extractUserRoles());
  }

  private resetState(): void {
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.userProfile.set(null);
    this.userRoles.set([]);
  }

  private extractUserRoles(): string[] {
    if (!this.keycloak) {
      return [];
    }

    const realmRoles = this.keycloak.realmAccess?.roles ?? [];
    const resourceRoles = Object.entries(this.keycloak.resourceAccess ?? {})
      .flatMap(([resource, access]) =>
        (access.roles ?? []).map(role => `${resource}:${role}`)
      );

    return [...new Set([...realmRoles, ...resourceRoles])]
      .filter(role =>
        VISIBLE_USER_ROLES.some(visibleRole =>
          matchesRole(role, visibleRole)
          || normalizeRole(role).endsWith(`:${normalizeRole(visibleRole)}`)
        )
      )
      .sort((left, right) => {
        if (matchesRole(left, ADMIN_REALM_ROLE)) {
          return -1;
        }

        if (matchesRole(right, ADMIN_REALM_ROLE)) {
          return 1;
        }

        return left.localeCompare(right);
      });
  }

  private hasRole(role: string): boolean {
    if (!this.keycloak) {
      return false;
    }

    const realmRoles = this.keycloak.realmAccess?.roles ?? [];
    const resourceRoles = Object.values(this.keycloak.resourceAccess ?? {})
      .flatMap(access => access.roles ?? []);

    return [...realmRoles, ...resourceRoles].some(grantedRole => matchesRole(grantedRole, role));
  }
}
