import {BaseDto} from "@shared-lib/base/base-dto";
import {QueryItemDTO} from "@global-app/find-data/dto/query";
import {SchemaNodeDto} from "@local-app/cohort/dto/schema";

export interface LocalQueryDto extends BaseDto {
  globalQueryId: number;
  query: QueryItemDTO[];
  enhancedQuery: LocalQueryItemDto[];
  status: string;
  statusMessage: string;
}

export interface LocalQueryItemDto extends QueryItemDTO {
  schemaNodes: SchemaNodeDto[];
}
