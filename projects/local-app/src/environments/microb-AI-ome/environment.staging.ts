import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - STAGING',
  localLearningAPIURL: 'local-learning-api',
  globalWebUrl: "https://dev.federated-learning.net/",
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
