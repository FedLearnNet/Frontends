import {KeycloakAuthGuard, KeycloakService} from "keycloak-angular";

import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot, CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { environment } from "@shared-lib/env/environment";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";


export function initializeKeycloak(keycloak: KeycloakService) {
  console.log('initializeKeycloak for global:', environment);
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      },
      bearerExcludedUrls: environment.keycloak.bearerExcludedUrls,
      shouldUpdateToken(request) {
        const tokenUpdateHeader = request.headers.get('token-update');
        return tokenUpdateHeader !== 'false';
      }
    });
}

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Redirect to login page if the user is unauthorized
          this.keycloakService.login({
            redirectUri: window.location.href // Keep the user on the current page after login
          });
        }
        return throwError(() => error); // Re-throw the error
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url
      });
    }

    // Get the roles required from the route.
    const requiredRoles = route.data["roles"];

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    return requiredRoles.every((role) => this.roles.includes(role));
  }
}


@Injectable({
  providedIn: 'root'
})
export class AllowDataModelingRouteGuard implements CanActivate {

  constructor() {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return !!(environment.allowGlobalDataModeling);
  }
}
