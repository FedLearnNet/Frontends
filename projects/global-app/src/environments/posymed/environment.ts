import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: false,
  project: 'PoSyMed',
  appTitle: 'PoSyMed',

  datamodelerApiUrl: 'http://localhost:8142',
  globalLearningApiUrl: 'http://localhost:8080',
  allowGlobalDataModeling: false,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
