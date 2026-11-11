import { Environment } from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'FEDDB-Local',
  appTitle: 'FEDDB-LOCAL - Local App - DEFAULT',
  localLearningAPIURL: undefined,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/local-auth',
    realm: 'fedDB-local',
  },
};
