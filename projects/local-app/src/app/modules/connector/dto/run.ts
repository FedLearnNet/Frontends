export interface RunDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  connectorId: number;
  progress: number;
  status: string;

  newEntities?: number;
  updatedEntities?: number;
  failedEntities?: number;
  deletedEntities?: number;
  unchangedEntities?: number;

  mode?: string;
  dry?: boolean;
  trigger?: string;
}
