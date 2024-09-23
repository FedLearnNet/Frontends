import { SchemaFieldStructure } from '@shared-lib/models/schema-field-structure';

export interface Schema {
    uniqueId: string;
    name: string;
    description: string;
    version: number;
    fields: SchemaFieldStructure[];
}
