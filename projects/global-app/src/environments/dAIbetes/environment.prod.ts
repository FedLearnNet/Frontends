import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

const GLOBAL_BASE_DOMAIN = "daibetes-net.federated-learning.net";

export const environment: Environment = {
  production: true,
  project: 'dAIbetes',
  appTitle: 'dAIbetesNet-Platform',

  datamodelerApiUrl: `https://${GLOBAL_BASE_DOMAIN}/data-modeler`,
  globalLearningApiUrl: `https://${GLOBAL_BASE_DOMAIN}/api`,
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
