export enum PublicationStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
  UNKNOWN = 'UNKNOWN',
}

export enum CohortCriterionType {
  INCLUSION = 'INCLUSION',
  EXCLUSION = 'EXCLUSION',
}

export enum EvidenceVariableRole {
  POPULATION = 'POPULATION',
  EXPOSURE = 'EXPOSURE',
  OUTCOME = 'OUTCOME',
  COVARIATE = 'COVARIATE',
}

export enum QueryOperatorTypes {
  EQUAL = 'EQUAL',
  SMALLER = 'SMALLER',
  SMALLER_EQUAL = 'SMALLER_EQUAL',
  BIGGER = 'BIGGER',
  BIGGER_EQUAL = 'BIGGER_EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  EXISTS = 'EXISTS',
  NOT_EXISTS = 'NOT_EXISTS',
  REGEX = 'REGEX',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  START_WIDTH = 'START_WIDTH',
  END_WIDTH = 'END_WIDTH',
}

export interface QueryOperatorDTO {
  operator: QueryOperatorTypes;
  value: string | string[];
}

export interface CohortCriterionDto {
  id?: number;
  type?: CohortCriterionType;
  variableRole?: EvidenceVariableRole;
  description?: string;
  ontologyId?: string;
  dataTypeId?: string;
  operator?: QueryOperatorDTO[];
}
