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
  globalSchemaID: string;
}
