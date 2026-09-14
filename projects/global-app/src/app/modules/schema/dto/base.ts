export interface BaseDTO {
  id?: string; // UUID
}

export interface BaseNodeDTO extends BaseDTO {
  label?: string;
}

export interface BaseEdgeDTO extends BaseDTO {
  label?: string;
  sourceId?: string;
  targetId?: string;
}
