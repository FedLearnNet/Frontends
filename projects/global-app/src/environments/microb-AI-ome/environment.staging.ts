import {Environment} from '@shared-lib/models/environment';

const GLOBAL_BASE_DOMAIN = "dev.federated-learning.net";

export const environment: Environment = {
  production: true,
  project: 'Microb·AI·ome',
  appTitle: 'Microb-AI-ome-Net Platform STAGING',
  globalLearningApiUrl: `https://${GLOBAL_BASE_DOMAIN}/api`,
  allowGlobalDataModeling: true,

  keycloak: {
    url: '/auth',
    realm: 'FLNet-Platform',
  },
};
