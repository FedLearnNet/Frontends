import { SchemaValidator } from '@local-app/cohort/models/schema-validator';
import { SelectOption } from '@shared-lib/models/index';

export interface SchemaFieldStructure {
    ontologyId: string;
    nodeType: string;
    formType: string;
    dataType: string;
    label: string;
    name: string;
    description: string;
    dataTypeDescription: string;
    ontologyDescription: string;
    value?: number | string | boolean;
    validations: SchemaValidator[];
    options?: SelectOption[];
    readonly?: boolean;
    fields?: SchemaFieldStructure[],
    schemaNodeId: string;
}
