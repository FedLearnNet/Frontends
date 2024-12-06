import {Environment} from "@shared-lib/models/environment";
//DEFAULT
export const environment: Environment = {
  project: 'SHARED LIB',
  production: false,
  appTitle: 'SHARED LIB',
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  }
};

