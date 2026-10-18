import {Environment} from '@shared-lib/models/environment';

export const environment: Environment = {
  production: true,
  project: 'FL-Net',
  appTitle: 'Federated Learning Network - Staging',
  datamodelerApiUrl: `data-modeler`,
  globalLearningApiUrl: `api`,
  allowGlobalDataModeling: true,

  keycloak: {
    url: '/auth',
    realm: 'FLNet-Platform',
  },
};
