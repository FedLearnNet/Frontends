import {CustomBearerTokenCondition} from 'keycloak-angular';
import {isProtectedApiUrl} from '@shared-lib/services/keycloak';

/** Attaches bearer tokens for protected API URLs; token refresh is handled by sessionInterceptor. */
export const bearerTokenCondition: CustomBearerTokenCondition = {
  bearerPrefix: 'Bearer',
  shouldAddToken: async (req, _next, keycloak) =>
    isProtectedApiUrl(req.url) && !!keycloak.authenticated,
  shouldUpdateToken: () => false,
};
