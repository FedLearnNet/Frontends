import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'FLNet',
  appTitle: 'FLNet-Client STAGING',
  localLearningAPIURL: 'local-learning-api',
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
