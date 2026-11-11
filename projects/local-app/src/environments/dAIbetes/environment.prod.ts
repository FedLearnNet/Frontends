import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'dAIbetes',
  appTitle: 'dAIbetesNet-Client',
  localLearningAPIURL: 'local-learning-api',
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
