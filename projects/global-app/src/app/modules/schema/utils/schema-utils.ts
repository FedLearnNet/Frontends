import {SchemaNodeType} from "@global-app/schema/dto/schema";

export function isSchemaAttribute(schemaType: SchemaNodeType) {
  switch (schemaType) {
    case SchemaNodeType.LIST_ATTRIBUTE:
    case SchemaNodeType.ATOMIC_ATTRIBUTE:
      return true;
    default:
      return false;
  }
}

export function getSchemaName(schemaType: SchemaNodeType) {
  switch (schemaType) {
    case SchemaNodeType.LIST_ATTRIBUTE:
      return "List Attribute";
    case SchemaNodeType.ATOMIC_ATTRIBUTE:
      return "Atomic Attribute";
    default:
      return schemaType.toString();
  }
}
