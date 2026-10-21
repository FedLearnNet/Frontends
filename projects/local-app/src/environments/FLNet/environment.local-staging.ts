import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'FL-Net',
  appTitle: 'FL-Net Site STAGING',
  localLearningAPIURL: 'local-learning-api',
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
