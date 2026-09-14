import {Injectable} from '@angular/core';
import Keycloak from 'keycloak-js';
import {getSessionIdleTimeoutMs} from '@shared-lib/services/keycloak';

const TOKEN_MIN_VALIDITY_SECONDS = 30;

/**
 * Tracks when Keycloak last validated the session server-side.
 * Access tokens remain valid locally after SSO session idle expires; forcing
 * refresh after the idle window detects that without waiting for JWT expiry.
 */
@Injectable({providedIn: 'root'})
export class KeycloakSessionService {
  private lastServerValidationMs = Date.now();

  async ensureValidSession(keycloak: Keycloak): Promise<void> {
    const idleMs = Date.now() - this.lastServerValidationMs;
    const forceRefresh = idleMs >= getSessionIdleTimeoutMs();
    const minValidity = forceRefresh ? -1 : TOKEN_MIN_VALIDITY_SECONDS;

    await keycloak.updateToken(minValidity);
    this.lastServerValidationMs = Date.now();
  }
}
