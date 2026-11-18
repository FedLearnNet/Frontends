import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';
import {CohortDetailDto} from '@local-app/cohort/models';
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

export function withUniquePatientIdNode(cohort: CohortDetailDto): CohortDetailDto {
  const children = cohort.schemaRoot?.childNodes ?? [];
  if (children.some(node => node.globalId === UNIQUE_PATIENT_ID_NODE.globalId)) {
    return cohort;
  }
  return {...cohort, schemaRoot: {...cohort.schemaRoot, childNodes: [...children, UNIQUE_PATIENT_ID_NODE]}};
}
