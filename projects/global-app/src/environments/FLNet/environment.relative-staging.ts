import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

export const environment: Environment = {
  production: true,
  project: 'FL-Net',
  // TODO: create the reelevant project settings
  appTitle: 'Federated Learning Network - Staging',

  datamodelerApiUrl: `data-modeler`,
  globalLearningApiUrl: `api`,
  allowGlobalDataModeling: true,

  keycloak: {
    url: '/auth',
    realm: 'FLNet-Platform',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
