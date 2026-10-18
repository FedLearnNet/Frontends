import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: false,
  project: 'PoSyMed',
  appTitle: 'PoSyMed',

  datamodelerApiUrl: 'http://localhost:8142',
  globalLearningApiUrl: `${window.location.origin}/api`, // proxy.conf.json
  allowGlobalDataModeling: false,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
  },
};
