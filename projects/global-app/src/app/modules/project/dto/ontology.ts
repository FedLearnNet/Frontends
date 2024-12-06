import {DataTypeUsagesDTO} from "./datatype";
import {BaseDto} from "@shared-lib/base/base-dto";

interface OntologyDto extends BaseDto {
  name?: string;
  desc?: string;
  children?: string[];
  parent_id?: string;
}

interface OntologyDataPreparationDto extends OntologyDto {
  datatypes?: DataTypeUsagesDTO[];
}

interface OntologyQueryabilityDto extends BaseDto {
  unique_id?: string;
  clients?: string[];
}

