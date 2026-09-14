import {Environment} from "@shared-lib/models/environment";
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';
//DEFAULT
export const environment: Environment = {
  project: 'Generic Global App',
  production: false,
  appTitle: 'Global App - dev',

  datamodelerApiUrl: 'http://localhost:8002',
  globalLearningApiUrl: 'http://localhost:8080',
  allowGlobalDataModeling: true,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  }
};

