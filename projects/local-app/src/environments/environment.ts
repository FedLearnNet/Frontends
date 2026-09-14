import { Environment } from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: true,
  project: 'FEDDB-Local',
  appTitle: 'FEDDB-LOCAL - Local App - DEFAULT',
  localLearningAPIURL: undefined,
  globalWebUrl: "https://platform.microbaiome.featurecloud.ai/",
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
