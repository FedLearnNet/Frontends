import {
  AuthGuardData,
  AutoRefreshTokenService,
  createAuthGuard,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken
} from "keycloak-angular";
import {inject, provideAppInitializer} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {environment} from "@shared-lib/env/environment";
import Keycloak from "keycloak-js";

export const ADMIN_REALM_ROLE = 'Admin';
export const AUDITOR_REALM_ROLE = 'Auditor';


export const getSessionIdleTimeoutMs = (): number => environment.keycloak.sessionIdleTimeoutMs;

const normalizeBaseHref = (): string => {
  const baseHref = environment.keycloak.baseHref?.trim() || '/';

  if (baseHref === '/') {
    return baseHref;
  }

  return `/${baseHref.replace(/^\/+|\/+$/g, '')}/`;
};

export const getKeycloakRedirectUri = (suffix: string = ''): string => {
  const baseHref = normalizeBaseHref();
  const normalizedSuffix = suffix.trim();

  if (!normalizedSuffix) {
    return `${window.location.origin}${baseHref}`;
  }

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(normalizedSuffix)) {
    return normalizedSuffix;
  }

  const suffixWithLeadingSlash = normalizedSuffix.startsWith('/')
    ? normalizedSuffix
    : `/${normalizedSuffix}`;
  const baseHrefWithoutTrailingSlash = baseHref.endsWith('/')
    ? baseHref.slice(0, -1)
    : baseHref;
  const suffixAlreadyContainsBaseHref = baseHref === '/'
    || suffixWithLeadingSlash === baseHrefWithoutTrailingSlash
    || suffixWithLeadingSlash.startsWith(baseHref);

  if (suffixAlreadyContainsBaseHref) {
    return `${window.location.origin}${suffixWithLeadingSlash}`;
  }

  return `${window.location.origin}${baseHref}${normalizedSuffix.replace(/^\/+/, '')}`;
};

const normalizeRole = (role: string): string => role.toLowerCase();
const matchesRole = (actualRole: string, requiredRole: string): boolean =>
  normalizeRole(actualRole) === normalizeRole(requiredRole);

export const PROTECTED_API_URL_PATTERN =
  /(localhost|featurecloud|local-learning-api|importer|data-modeler|api|cosy\.bio)/i;

export const isProtectedApiUrl = (url: string): boolean => PROTECTED_API_URL_PATTERN.test(url);

export const getCurrentPath = (): string =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

let reauthenticateInProgress = false;

export const isReauthenticationPending = (): boolean => reauthenticateInProgress;

export const reauthenticate = (keycloak: Keycloak, returnPath?: string): void => {
  if (reauthenticateInProgress) {
    return;
  }

  reauthenticateInProgress = true;
  const redirectUri = getKeycloakRedirectUri(returnPath ?? getCurrentPath());

  void keycloak.login({redirectUri, prompt: 'login'})
    .catch((error) => {
      console.error('Failed to redirect to login, logging out', error);
      reauthenticateInProgress = false;
      return keycloak.logout({redirectUri});
    });
};

export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: getKeycloakRedirectUri('assets/silent-check-sso.html'),
      redirectUri: getKeycloakRedirectUri()
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'login',
        sessionTimeout: getSessionIdleTimeoutMs(),
        loginOptions: {
          redirectUri: getKeycloakRedirectUri()
        }
      })
    ],
    providers: [
      AutoRefreshTokenService,
      UserActivityService,
      provideAppInitializer(() => {
        const keycloak = inject(Keycloak);
        keycloak.onAuthLogout = () => reauthenticate(keycloak);
        keycloak.onAuthRefreshError = () => reauthenticate(keycloak);
      }),
    ]
  });


const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const {authenticated, grantedRoles} = authData;
  const requiredRole = route.data['role'];

  if (!requiredRole && authenticated) {
    return true;
  }

  // Force the user to log in if currently unauthenticated.
  if (!authenticated) {
    const keycloak: Keycloak = inject(Keycloak);
    await keycloak.login({
      redirectUri: getKeycloakRedirectUri(state.url)
    });
  }

  const keycloak: Keycloak = inject(Keycloak);
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  const hasRequiredRole = (role: string): boolean =>
    grantedRoles.realmRoles.some(grantedRole => matchesRole(grantedRole, role))
    || Object.values(grantedRoles.resourceRoles).some((roles) =>
      roles.some(grantedRole => matchesRole(grantedRole, role))
    )
    || keycloak.hasRealmRole(role)
    || keycloak.hasRealmRole(normalizeRole(role))
    || keycloak.hasRealmRole(role.charAt(0).toUpperCase() + role.slice(1));

  if (authenticated && requiredRoles.some(hasRequiredRole)) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/');
};

const isAllowGlobalDataModeling = async (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
  _guard: AuthGuardData
): Promise<boolean | UrlTree> => {
  return !!(environment.allowGlobalDataModeling);
};


export const AuthGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);
export const AllowDataModelingRouteGuard = createAuthGuard<CanActivateFn>(isAllowGlobalDataModeling);
