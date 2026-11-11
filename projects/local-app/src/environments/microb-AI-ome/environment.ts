import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: false,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Local App - DEV',
  localLearningAPIURL: `${window.location.origin}/local-learning-api`, // proxy.conf.json
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
  },
};
