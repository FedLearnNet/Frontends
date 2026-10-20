import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: false,
  project: 'FL-Net',
  appTitle: 'Federated Learning Network - DEV',
  globalLearningApiUrl: `${window.location.origin}/api`, // proxy.conf.json
  allowGlobalDataModeling: true,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
  },
};
