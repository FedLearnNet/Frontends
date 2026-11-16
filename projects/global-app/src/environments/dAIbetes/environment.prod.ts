import {Environment} from '@shared-lib/models/environment';

const GLOBAL_BASE_DOMAIN = "daibetes-net.federated-learning.net";

export const environment: Environment = {
  production: true,
  project: 'dAIbetes',
  appTitle: 'dAIbetesNet-Platform',
  globalLearningApiUrl: `https://${GLOBAL_BASE_DOMAIN}/api`,
  allowGlobalDataModeling: true,

  keycloak: {
    url: '/auth',
    realm: 'FLNet-Platform',
  },
};
