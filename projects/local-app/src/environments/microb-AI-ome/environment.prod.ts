import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - PROD',
  importerApiUrl: 'importer',
  harmonizedApiUrl: 'harmonized',
  clientMetaApiUrl: 'meta',
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  },
};
