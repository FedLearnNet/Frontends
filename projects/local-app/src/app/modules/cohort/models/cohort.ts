import {ExternalDatabaseAccess, ExternalDatabaseType, TreTestDataFileDto} from '@shared-lib/modules/workflow/dto/tre-source';
import {BaseAuthDto} from "@shared-lib/base/base-dto";
import {SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {CohortMemberDto} from "@local-app/cohort/models/cohort-member";
import {CohortCriterionDto, PublicationStatus} from "@local-app/cohort/models/cohort-criteria";
export interface CohortDto extends BaseAuthDto {
  name: string;
  description: string;
  citeAs?: string;
  status?: PublicationStatus;
  deletionInProgress?: boolean;
  approvalDate?: Date;
  purpose?: string;
  copyright?: string;
  copyrightLabel?: string;
  criteria?: CohortCriterionDto[];

  amountOfPatients: number;

  globalSchemaId: string;
  internalSchemaId: number;
  externalDatabase?: ExternalDatabaseDto;
}

export interface ExternalDatabaseDto {
  type: ExternalDatabaseType;
  location?: 'CONTAINER' | 'ADDRESS';
  host: string;
  port: number;
  database?: string;
  username?: string;
  password?: string;
  env?: Record<string, string>;
  access?: ExternalDatabaseAccess;
  toolVersionId?: number;
  toolName?: string;
  hyperParams?: Record<string, unknown>;
  // synthetic test data: a script, a link or how to get it, shown on the platform
  testData?: string;
  // on the platform's file store, set only by uploading it
  testDataFile?: TreTestDataFileDto;
}

export interface CohortDetailDto extends CohortDto {
  schemaRoot: SchemaRootNodeDto;
  members: CohortMemberDto[];
}


export interface CohortNameHealthDto {
  name: string;
  nameExists: boolean;
}

export interface CreateCohortDto {
  name: string;
  description: string;
  citeAs?: string;
  status?: PublicationStatus;
  purpose?: string;
  copyright?: string;
  copyrightLabel?: string;
  criteria?: CohortCriterionDto[];
  globalSchemaID?: string;
  externalDatabase?: ExternalDatabaseDto;
}
