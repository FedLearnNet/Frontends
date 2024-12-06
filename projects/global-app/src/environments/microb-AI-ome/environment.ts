export const environment = {
  production: false,
  project: 'Microb·AI·ome',
  appTitle: 'Microb·AI·ome - Global App - DEV',
  datamodelerApiUrl: 'http://localhost:8002',
  queryControllerApiUrl: 'http://localhost:8080',
  globalDBApiUrl: 'http://localhost:8080',
  globalDBApiWSUrl: 'ws://localhost:8080',
  allowGlobalDataModeling: true,
  keycloak: {
    url: 'https://staging.featurecloud.ai/feddb/global-auth',
    realm: 'FederatedDB_Global',
    clientId: 'frontend',
    bearerExcludedUrls: ['/assets', '/clients/public']
  },
};
