import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - PROD',
  localLearningAPIURL: 'local-learning-api',
  globalWebUrl: "https://dev-platform.microbaiome.cosy.bio/",
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
