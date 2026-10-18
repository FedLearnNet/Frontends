export interface Environment {
    production: boolean; // whether to deploy in production mode
    project: string;
    appTitle: string;
    // Local services
    localLearningAPIURL?: string;

    // Global Services
    globalLearningApiUrl?: string; // http(s) address of the global learning service
    globalLearningApiWSProtocol?: string; // ws(s) replace http or https://
    datamodelerApiUrl?: string;
    allowGlobalDataModeling?: boolean; // If false, disables certain parts showing the data models

    // address of the global web frontend. Only needed by the local app for certain frontend
    // services of the global platform.
    // Only the local app has to set this!
    globalWebUrl?: string;

    // The login itself runs in the learning API (backend-for-frontend), Keycloak is only linked for account management.
    keycloak: {
        url: string; // Base URL of the Keycloak server, so without any path (except e.g. /auth if deployed on auth)
        realm: string;
        baseHref?: string;
    },
}
