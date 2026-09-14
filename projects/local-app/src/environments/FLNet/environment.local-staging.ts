import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: true,
  project: 'FL-Net',
  appTitle: 'FL-Net Site STAGING',
  localLearningAPIURL: 'local-learning-api',
  globalWebUrl: "http://localhost:4300/api",
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
