import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - PROD',
  localLearningAPIURL: 'local-learning-api',
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
