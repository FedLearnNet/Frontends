import {SelectOption} from '@shared-lib/models';
import {DataTypes} from "@global-app/schema/dto/datatype";
import {QueryOperatorTypes} from "@global-app/find-data/dto/query";

export interface DataTypeOperatorMap {
  type: DataTypes;
  // The data type type, so e.g. boolean, string, number
  description: string;
  options: Array<SelectOption<QueryOperatorTypes>>;
  // An array of the generic SelectOption objects
  // In this case, this is the mapping of the operator to show to the user (e.g. >)
  // and the actal value to use (e.g. gt)
}
