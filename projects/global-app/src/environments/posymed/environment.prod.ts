import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'Posymed',
  appTitle: 'Posymed',
  datamodelerApiUrl: 'https://posymed.featurecloud.ai/data-modeler',
  queryControllerApiUrl: 'https://posymed.featurecloud.ai/api',
  globalDBApiUrl: 'https://posymed.featurecloud.ai/api',
  globalDBApiWSUrl: 'wss://posymed.featurecloud.ai/api',
  allowGlobalDataModeling: false,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  },
};
