import {OntologyDTO} from "@global-app/schema/dto/ontology";

export interface DataTypeSubscriptionDTO {
  dataTypeId: string;
  subscriptionsCount: number;
}

export interface DataTypeValidationDTO {
  name: string;
  validator: string;
  message: string;
}

export interface DataTypeDTO {
  uniqueId?: string;
  name: string;
  desc: string;
  type: string;


  validations: DataTypeValidationDTO[];
  allowedValues: string[];

  ontologyId?: string;
  schemaIds?: string[];

  //NOT YET USED
  allowed_values_extendible?: boolean;
  mapping?: object;
}


export interface DataTypeDetailDTO extends DataTypeDTO {
  ontology?: OntologyDTO

  subscriptionsCount?: number
}
