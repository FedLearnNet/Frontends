import {BaseDto} from "@shared-lib/base/base-dto";

export interface QueryOperatorDTO {
  operator: string;
  value: string | string[];
}

export interface QueryItemDTO {
  ontologyId: string;
  operator: QueryOperatorDTO[];
}

export interface CreateQueryDTO {
  query: QueryItemDTO[];
  description: string;
  name: string;
}


export interface QueryDTO extends BaseDto {
  query: QueryItemDTO[];
  description: string;
  name: string;
  result: number;
  hasResult: boolean;

  hasFired: boolean;
  keycloakId: string;

  projectId?: number;
}
