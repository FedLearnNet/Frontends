import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: false,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - DEV',
  localLearningAPIURL: 'http://localhost:8081',
  globalWebUrl: "http://localhost:4201/",
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
