import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Global App - PROD',
  datamodelerApiUrl: 'https://platform.microbaiome.featurecloud.ai/data-modeler',
  queryControllerApiUrl: 'https://platform.microbaiome.featurecloud.ai/api',
  globalDBApiUrl: 'https://platform.microbaiome.featurecloud.ai/api',
  globalDBApiWSUrl: 'wss://platform.microbaiome.featurecloud.ai/api',
  allowGlobalDataModeling: true,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  },
};
