import {DataTypeNodeDTO, DataTypes} from "@global-app/schema/dto/datatype";
import {required, schema} from "@angular/forms/signals";

export type DatatypeForm = Required<DataTypeNodeDTO>;

export const datatypeFormInitValue: DatatypeForm = {
  id: '',
  name: '',
  label: '',
  description: '',
  type: DataTypes.STRING,
  allowNullValues: true,
  isRequired: false,
  validations: [],
  options: [],
  ontologyIds: [],
  schemaIds: []
}

export const datatypeFormSchema = schema<DatatypeForm>((path) => {
  required(path.name);
  required(path.type);
})
