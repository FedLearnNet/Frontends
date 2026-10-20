import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: false,
  project: 'FLNet',
  appTitle: 'FLNet-Client DEV',
  localLearningAPIURL: `${window.location.origin}/local-learning-api`, // proxy.conf.json
  globalWebUrl: "http://localhost:4201/",
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
  },
};
