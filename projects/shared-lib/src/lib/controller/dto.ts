
export interface ControllerStatusDto {
  isOnline: boolean;
  token: string;
  globalBackendUrl: string;
  relayServerUrl: string;
  registryUrl: string;
  isDockerAvailable: boolean;
  workspaceDirectory: string;
  testDirectory: string;
}
