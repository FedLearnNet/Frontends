import {Environment} from "@shared-lib/models/environment";
//DEFAULT
export const environment: Environment = {
  project: 'Microb·AI·ome',
  production: false,
  appTitle: 'Global App - dev',
  datamodelerApiUrl: 'http://localhost:8002',
  queryControllerApiUrl: 'http://localhost:8080',
  globalDBApiUrl: 'http://localhost:8080',
  globalDBApiWSUrl: 'ws://localhost:8080',
  allowGlobalDataModeling: true,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  }
};

