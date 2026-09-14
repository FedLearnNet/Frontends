import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {BaseNodeDTO} from "@global-app/schema/dto/base";
import {PatientExportFeatureDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";

export enum DataTypeValidationType {
  REQUIRED = 'REQUIRED',
  MINLENGTH = 'MINLENGTH',
  MAXLENGTH = 'MAXLENGTH',
  PATTERN = 'PATTERN',
  MIN = 'MIN',
  MAX = 'MAX'
}

export interface DataTypeSubscriptionDTO {
  dataTypeId: string;
  subscriptionsCount: number;
}

export interface DataTypeValidationDTO {
  name: string;
  validator: string;
  message: string;
}

export enum DataTypes {
  INT = "INT",
  FLOAT = "FLOAT",
  BOOLEAN = "BOOLEAN",
  STRING = "STRING",
  FILE = "FILE",
  DATE = "DATE",
  DATE_TIME = "DATE_TIME",
  CATEGORICAL = "CATEGORICAL"
}

export interface DataTypeNodeDTO extends BaseNodeDTO {
  name: string;
  description: string;
  type: DataTypes;

  allowNullValues?: boolean;
  isRequired?: boolean;
  validations: DataTypeValidationDTO[];
  options: string[];

  ontologyIds?: string[];
  schemaIds?: string[];
}


export interface DataTypeDetailDTO extends DataTypeNodeDTO {
  ontologies?: OntologyNodeDTO[]

  subscriptionsCount?: number
}

export interface DataTypeDetailFlatten extends DataTypeNodeDTO {
  ontology?: OntologyNodeDTO

  subscriptionsCount?: number
}

export interface DummyDataRequestDTO {
  features: PatientExportFeatureDTO[];
  amount?: number;
  wideFormat?: boolean;
  asFile?: boolean;
}
