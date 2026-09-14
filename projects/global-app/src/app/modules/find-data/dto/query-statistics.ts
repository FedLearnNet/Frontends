import {BaseDto} from "@shared-lib/base/base-dto";

export type StatisticsCategoryEntry =
  | [string, number]
  | {key?: string; value?: number; count?: number; name?: string}
  | Record<string, number>;

export interface StatisticsColumnProfile {
  name: string;
  type: string;
  count: number;
  missing: number;
  uniqueValues?: number | null;
  mean?: number | null;
  std?: number | null;
  min?: number | null;
  p25?: number | null;
  median?: number | null;
  p75?: number | null;
  max?: number | null;
  topCategories?: StatisticsCategoryEntry[] | null;
}

export interface DataStatisticsDTO {
  properties: StatisticsColumnProfile[];
}

export interface DataStatisticsResponseDTO extends BaseDto {
  statistics: DataStatisticsDTO;
  queryId: number;
  randomClinicId: string;
  requestId: string;
}
