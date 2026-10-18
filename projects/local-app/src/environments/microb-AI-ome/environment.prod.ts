import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - PROD',
  localLearningAPIURL: 'local-learning-api',
  globalWebUrl: "https://dev-platform.microbaiome.cosy.bio/",
  keycloak: {
    url: '/auth',
    realm: 'FLNet-Client',
  },
};
