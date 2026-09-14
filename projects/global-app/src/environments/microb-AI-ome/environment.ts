import {Environment} from '@shared-lib/models/environment';
import { KEYCLOAK_SESSION_IDLE_TIMEOUT_MS } from '@shared-lib/constants/keycloak.constants';

const useProxyForLearningAPI = false;
const useGlobalForDataModeler = true;

const API_PORT_LEARNING = useProxyForLearningAPI ? 80 : 8080;
const SUFFIX_LEARNING = useProxyForLearningAPI ? "/api" : "";

const GLOBAL_DATA_MODELER_URL = "https://dev.federated-learning.net/data-modeler";
const LOCAL_DATA_MODELER_URL = `http://localhost:8086`;
const DATA_MODELER_URL = useGlobalForDataModeler ? GLOBAL_DATA_MODELER_URL : LOCAL_DATA_MODELER_URL;


export const environment: Environment = {
  production: false,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Global App - DEV',
  globalLearningApiUrl: `http://localhost:${API_PORT_LEARNING}${SUFFIX_LEARNING}`,
  datamodelerApiUrl: DATA_MODELER_URL,
  allowGlobalDataModeling: true,

  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public'],
    redirectOnHttp401: true,
    sessionIdleTimeoutMs: KEYCLOAK_SESSION_IDLE_TIMEOUT_MS,
  },
};
