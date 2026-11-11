import {computed, inject, Injectable, signal} from "@angular/core";
import {HttpBackend, HttpClient, HttpHeaders} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {
  ADMIN_REALM_ROLE,
  AUDITOR_REALM_ROLE,
  BFF_REQUEST_HEADER,
  BFF_REQUEST_HEADER_VALUE,
  getBffUrl
} from "@shared-lib/services/auth.helper";

/** User of the browser session as returned by GET /bff/me. */
export interface BffUser {
  username: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

const VISIBLE_USER_ROLES = [ADMIN_REALM_ROLE];
const normalizeRole = (role: string): string => role.toLowerCase();
const matchesRole = (actualRole: string, requiredRole: string): boolean =>
  normalizeRole(actualRole) === normalizeRole(requiredRole);

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  // Bypasses the interceptors: a missing session must not trigger the login redirect of authInterceptor.
  private readonly http = new HttpClient(inject(HttpBackend));

  readonly userProfile = signal<BffUser | null>(null);
  readonly isLoggedIn = computed(() => this.userProfile() !== null);
  readonly isAdmin = computed(() => this.hasRole(ADMIN_REALM_ROLE));
  readonly isAuditor = computed(() => this.hasRole(AUDITOR_REALM_ROLE));
  readonly userRoles = computed(() => this.extractUserRoles());

  readonly statusKey = computed(() => {
    if (!this.isLoggedIn()) {
      return 'GUEST';
    }

    if (this.isAuditor()) {
      return 'USER';
    }
    return this.isAdmin() ? 'MENU.ADMIN' : 'USER';
  });

  /** Loads the session user; without a valid session the user is a guest. */
  async load(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<BffUser>(getBffUrl('me'), {
        headers: new HttpHeaders({[BFF_REQUEST_HEADER]: BFF_REQUEST_HEADER_VALUE}),
      }));
      this.userProfile.set(user);
    } catch {
      this.userProfile.set(null);
    }
  }

  hasRole(role: string): boolean {
    return (this.userProfile()?.roles ?? []).some(grantedRole => matchesRole(grantedRole, role));
  }

  private extractUserRoles(): string[] {
    return (this.userProfile()?.roles ?? [])
      .filter(role => VISIBLE_USER_ROLES.some(visibleRole => matchesRole(role, visibleRole)))
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
}
