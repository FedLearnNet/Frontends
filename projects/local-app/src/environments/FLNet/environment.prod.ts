import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: true,
  project: 'FLNet',
  appTitle: 'FLNet-Client',
  localLearningAPIURL: 'local-learning-api',
  globalWebUrl: "https://federated-learning.net/",
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
