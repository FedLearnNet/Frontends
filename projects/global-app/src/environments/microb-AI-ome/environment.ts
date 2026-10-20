import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: false,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Global App - DEV',
  globalLearningApiUrl: `${window.location.origin}/api`, // proxy.conf.json
  allowGlobalDataModeling: true,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
  },
};
