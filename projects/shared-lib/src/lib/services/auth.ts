import {inject, provideAppInitializer} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {environment} from "@shared-lib/env/environment";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {getBffUrl} from "@shared-lib/services/auth.helper";
import {getCurrentPath, toAbsolutePath} from "@shared-lib/utils/url.helper";

/*
 * Backend-for-frontend (BFF) auth: our API runs the OIDC login with Keycloak and keeps
 * the tokens in an HttpOnly session cookie. The browser never sees a token, it only follows redirects.
 */
const RETURN_PATH_KEY = 'bff.returnPath';

let loginInProgress = false;

export const isLoginPending = (): boolean => loginInProgress;

export const login = (returnPath: string = getCurrentPath()): void => {
  if (loginInProgress) {
    return;
  }

  loginInProgress = true;
  try {
    sessionStorage.setItem(RETURN_PATH_KEY, returnPath);
  } catch {
    // without session storage the user just lands on the start page
  }
  window.location.assign(getBffUrl('login'));
};

export const logout = (): void => {
  window.location.assign(getBffUrl('logout'));
};

const restoreReturnPath = (): void => {
  let returnPath: string | null = null;
  try {
    returnPath = sessionStorage.getItem(RETURN_PATH_KEY);
    sessionStorage.removeItem(RETURN_PATH_KEY);
  } catch {
    return;
  }

  if (returnPath?.startsWith('/') && !returnPath.startsWith('//') && returnPath !== getCurrentPath()) {
    window.history.replaceState(window.history.state, '', returnPath);
  }
};

export const provideBffAuth = () =>
  provideAppInitializer(async () => {
    const authState = inject(AuthStateService);
    await authState.load();
    if (authState.isLoggedIn()) {
      restoreReturnPath();
    }
  });

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authState = inject(AuthStateService);

  if (!authState.isLoggedIn()) {
    login(toAbsolutePath(state.url));
    return false;
  }

  const requiredRole = route.data['role'];
  if (!requiredRole) {
    return true;
  }

  const requiredRoles: string[] = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (requiredRoles.some(role => authState.hasRole(role))) {
    return true;
  }

  return inject(Router).parseUrl('/');
};

export const AllowDataModelingRouteGuard: CanActivateFn = () => !!environment.allowGlobalDataModeling;
