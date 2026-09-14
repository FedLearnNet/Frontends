import {BaseEdgeDTO, BaseNodeDTO} from "@global-app/schema/dto/base";

export interface OntologyDTO {
  edges: OntologyEdgeDTO[];
  nodes: OntologyNodeDTO[];
}

export interface CreateOntologyDTO {
  edges: OntologyEdgeDTO[];
  ontology: OntologyNodeDTO;
}

export interface OntologyNodeDTO extends BaseNodeDTO {
  names?: string[];
  description?: string;
  codes?: string[];
  sabs?: string[];
  cui?: string;
  auis?: string[];
  lat?: string;
}

export interface OntologyEdgeDTO extends BaseEdgeDTO {
  type?: string;
  description?: string;
  rel?: string;
  rela?: string;
  sab?: string;
}

export interface OntologySearchResponseDTO {
  node: OntologyNodeDTO;
  score?: number;
}
