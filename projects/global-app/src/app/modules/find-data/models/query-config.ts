import {SelectOption} from '@shared-lib/models';
import {DataTypeOperatorMap} from '@global-app/find-data/models/query-option';
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {DataTypeNodeDTO} from "@global-app/schema/dto/datatype";

export interface QueryConfig {
  schemaIds: string[];
  subscriptionCount: number;
  name: string;
  label: string;
  ontology: OntologyNodeDTO;
  dataType: DataTypeNodeDTO;
  options?: SelectOption[];
  queryOperatorOption?: DataTypeOperatorMap;
}
