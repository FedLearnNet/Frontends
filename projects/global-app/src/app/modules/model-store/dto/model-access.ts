import {BaseDto} from "@shared-lib/base/base-dto";

export enum ModelAccess {
  CREATED = 'CREATED',
  READ = 'READ',
  USE = 'USE',
  DOWNLOAD = 'DOWNLOAD'
}

export interface ModelAccessDto extends BaseDto {

  access: ModelAccess;

  keycloakId: string;
  groupName: string;
  modelId: number;
}
