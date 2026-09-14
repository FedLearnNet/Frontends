import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

const GLOBAL_BASE_DOMAIN = "apps.cosy.bio/posymed";

export const environment: Environment = {
  production: true,
  project: 'PoSyMed',
  appTitle: 'PoSyMed',

  datamodelerApiUrl: `https://${GLOBAL_BASE_DOMAIN}/data-modeler`,
  globalLearningApiUrl: `https://${GLOBAL_BASE_DOMAIN}/api`,
  allowGlobalDataModeling: false,

  keycloak: {
    url: `https://${GLOBAL_BASE_DOMAIN}/auth`,
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
    baseHref: '/posymed/'
  },
};
