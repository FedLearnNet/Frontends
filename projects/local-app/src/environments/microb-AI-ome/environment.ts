import { Environment } from '@shared-lib/models/environment';

export const environment: Environment = {
    production: false,
    project: 'Microb·AI·ome',
    appTitle: 'Microb·AI·ome - Local App - DEV',
    importerApiUrl: 'http://localhost:8001',
    harmonizedApiUrl: 'http://localhost:8234',
    clientMetaApiUrl: 'http://localhost:8003',
    keycloak: {
        url: 'https://staging.featurecloud.ai/feddb/local-auth',
        realm: 'fedDB-local',
        clientId: 'frontend',
        bearerExcludedUrls: ['/assets', '/clients/public']
    },
};
