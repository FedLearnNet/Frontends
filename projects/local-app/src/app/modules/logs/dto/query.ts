import {BaseDto} from "@shared-lib/base/base-dto";
import {QueryGroupDTO, QueryLeafDTO} from "@global-app/find-data/dto/query-item";
import {SchemaNodeDto} from "@local-app/cohort/dto/schema";

export interface LocalQueryDto extends BaseDto {
  globalQueryId: number;
  query: QueryGroupDTO;
  enhancedQuery: LocalQueryItemDto[];
  status: string;
  statusMessage: string;
}

// leaf of the query with its local schema nodes
export interface LocalQueryItemDto extends QueryLeafDTO {
  schemaNodes: SchemaNodeDto[];
}
