import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'FLNet',
  appTitle: 'FLNet-Client',
  localLearningAPIURL: 'local-learning-api',
  globalWebUrl: "https://federated-learning.net/",
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
