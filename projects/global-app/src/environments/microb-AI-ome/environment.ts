import {Environment} from '@shared-lib/models/environment';

const useGlobalForDataModeler = true;


const GLOBAL_DATA_MODELER_URL = "https://dev.federated-learning.net/data-modeler";
const LOCAL_DATA_MODELER_URL = `http://localhost:8086`;
const DATA_MODELER_URL = useGlobalForDataModeler ? GLOBAL_DATA_MODELER_URL : LOCAL_DATA_MODELER_URL;


export const environment: Environment = {
  production: false,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Global App - DEV',
  globalLearningApiUrl: `${window.location.origin}/api`, // proxy.conf.json
  datamodelerApiUrl: DATA_MODELER_URL,
  allowGlobalDataModeling: true,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
  },
};
