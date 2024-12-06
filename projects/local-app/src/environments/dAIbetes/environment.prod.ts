import { Environment } from '@shared-lib/models/environment';

export const environment: Environment = {
    production: true,
    project: 'dAIbetes',
    appTitle: 'dAIbetes - Local App - PROD',
    importerApiUrl: 'importer',
    harmonizedApiUrl: 'harmonized',
    clientMetaApiUrl: 'meta',
    keycloak: {
        url: 'https://staging.featurecloud.ai/feddb/local-auth',
        realm: 'fedDB-local',
        clientId: 'frontend',
        bearerExcludedUrls: ['/assets', '/clients/public']
    },
};
