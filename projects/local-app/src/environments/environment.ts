import {Environment} from "@shared-lib/models/environment";
//DEFAULT
export const environment: Environment = {
  project: 'Microb·AI·ome',
  production: false,
  appTitle: 'Local App - dev',
  importerApiUrl: 'http://localhost:8001',
  harmonizedApiUrl: 'http://localhost:8000',
  clientMetaApiUrl: 'http://localhost:8003',
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  }
};

