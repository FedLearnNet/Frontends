import {Environment} from "@shared-lib/models/environment";
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';
//DEFAULT
export const environment: Environment = {
  project: 'SHARED LIB',
  production: false,
  appTitle: 'SHARED LIB',
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  }
};
