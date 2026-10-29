import {disabled, required, requiredError, schema, SchemaPath, validate} from "@angular/forms/signals";
import {SchemaNodeDetailDTO, SchemaNodeType} from "@global-app/schema/dto/schema";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {DataTypeNodeDTO} from "@global-app/schema/dto/datatype";

export interface SchemaNodeForm {
  name: string;
  description: string;
  type: SchemaNodeType | null;
  ontology: OntologyNodeDTO | null;
  dataType: DataTypeNodeDTO | null;
}

export function toSchemaNodeForm(node?: SchemaNodeDetailDTO): SchemaNodeForm {
  return {
    name: node?.name ?? '',
    description: node?.description ?? '',
    type: node?.type ?? null,
    ontology: node?.ontology?.id === node?.ontologyId ? node?.ontology ?? null : null,
    dataType: node?.dataType?.id === node?.dataTypeId ? node?.dataType ?? null : null,
  };
}

function requiredText(path: SchemaPath<string>): void {
  required(path);
  validate(path, ({value}) => value() && !value().trim() ? requiredError() : undefined);
}

export const schemaNodeFormSchema = schema<SchemaNodeForm>(path => {
  requiredText(path.name);
  requiredText(path.description);
  required(path.type);
  disabled(path.dataType, {when: ({valueOf}) => !valueOf(path.ontology)});
});
