import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';
import {DatatypeFormTypeEnum, DataTypeTypeEnum} from '@local-app/cohort/dto/data-type';

export const UNIQUE_PATIENT_ID_NODE: SchemaNodeNestedDto = {
  description: 'Unique Patient ID',
  name: 'Unique Patient ID',
  nodeType: SchemaNodeTypeEnum.ATTRIBUTE,
  globalId: 'externalPatientId', // patient_id
  dataType: {
    name: 'Unique Patient ID',
    description: 'Unique Patient ID',
    type: DataTypeTypeEnum.STRING,
    formType: DatatypeFormTypeEnum.TEXT,
    isRequired: true,
    validations: [],
  } as any,
  ontology: {
    name: 'Unique Patient ID',
    description: 'Unique Patient ID',
  } as any,
  childNodes: [],
} as any;
