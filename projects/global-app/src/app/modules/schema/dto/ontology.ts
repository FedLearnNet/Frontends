export interface OntologyDTO {
  uniqueId?: string;
  name: string;
  desc: string;
  parentIds: string[];
  childrenIds: string[];
  rootSource?: string;
}
