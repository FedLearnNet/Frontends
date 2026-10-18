import {Environment} from '@shared-lib/models/environment';

const GLOBAL_BASE_DOMAIN = "federated-learning.net";

export const environment: Environment = {
  production: true,
  project: 'FL-Net',
  // TODO: create the reelevant project settings
  appTitle: 'Federated Learning Network',
  globalLearningApiUrl: `https://${GLOBAL_BASE_DOMAIN}/api`,
  allowGlobalDataModeling: true,

  keycloak: {
    url: '/auth',
    realm: 'FLNet-Platform',
  },
};
