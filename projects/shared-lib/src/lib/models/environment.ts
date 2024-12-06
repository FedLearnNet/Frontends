export interface Environment {
    production: boolean;
    project: string;
    appTitle: string;
    globalDBApiUrl?: string;
    importerApiUrl?: string;
    harmonizedApiUrl?: string;
    clientMetaApiUrl?: string;
    datamodelerApiUrl?: string;
    globalDBApiWSUrl?: string;
    allowGlobalDataModeling?: boolean;
    queryControllerApiUrl?: string;
    keycloak: {
        url: string;
        realm: string;
        clientId: string;
        bearerExcludedUrls: string[],
    },
}
