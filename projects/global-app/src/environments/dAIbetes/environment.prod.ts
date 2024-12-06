import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'dAIbetes',
  appTitle: 'dAIbetes - Global App - PROD',
  datamodelerApiUrl: 'https://platform.daibetes.featurecloud.ai/data-modeler',
  queryControllerApiUrl: 'https://platform.daibetes.featurecloud.ai/api',
  globalDBApiUrl: 'https://platform.daibetes.featurecloud.ai/api',
  globalDBApiWSUrl: 'wss://platform.daibetes.featurecloud.ai/api',
  allowGlobalDataModeling: true,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  },
};
