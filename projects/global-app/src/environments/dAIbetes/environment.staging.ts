import {Environment} from '@shared-lib/models/environment';

const GLOBAL_BASE_DOMAIN = "dev.federated-learning.net";

export const environment: Environment = {
  production: true,
  project: 'dAIbetes',
  // TODO: create the reelevant project settings
  appTitle: 'dAIbetesNet-Platform Staging',
  globalLearningApiUrl: `https://${GLOBAL_BASE_DOMAIN}/api`,
  allowGlobalDataModeling: true,

  keycloak: {
    url: '/auth',
    realm: 'FLNet-Platform',
  },
};
