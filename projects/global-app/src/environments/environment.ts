import {Environment} from "@shared-lib/models/environment";
//DEFAULT
export const environment: Environment = {
  project: 'Generic Global App',
  production: false,
  appTitle: 'Global App - dev',

  datamodelerApiUrl: 'http://localhost:8002',
  globalLearningApiUrl: `${window.location.origin}/api`, // proxy.conf.json
  allowGlobalDataModeling: true,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
  }
};

