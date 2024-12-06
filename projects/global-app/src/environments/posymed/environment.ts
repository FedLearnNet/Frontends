import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: false,
  project: 'Posymed',
  appTitle: 'Posymed',
  datamodelerApiUrl: 'http://localhost:8002',
  queryControllerApiUrl: 'http://localhost:8080',
  globalDBApiUrl: 'http://localhost:8080',
  globalDBApiWSUrl: 'ws://localhost:8080',
  allowGlobalDataModeling: false,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  },
};
