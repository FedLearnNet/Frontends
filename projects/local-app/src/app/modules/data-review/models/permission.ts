import {BaseDto} from "@shared-lib/base/base-dto";


export enum AutoTrainingAccess{
  ALL= 'ALL',
  NONE = 'NONE',
  CERTIFIED_APPS = 'CERTIFIED_APPS',
}

export enum AutoStatisticsAccess {
  ALL = 'ALL',
  NONE = 'NONE',
}

export enum AutoMetricsAccess {
  ALL = 'ALL',
  NONE = 'NONE',
}

export interface CreatePermissionDTO {
  userId?: string | null;
  isAllowedToQuery: boolean;
  queryRetryTime: number | null;
  autoTrainingAccess: AutoTrainingAccess | null;
  autoStatisticsAccess: AutoStatisticsAccess | null;
  autoMetricsAccess: AutoMetricsAccess | null;
  querySampleThreshold: number | null;
  validFrom?: string | null;
  validUntil?: string | null;

  cohortId?: number;
}


export interface PermissionDTO extends BaseDto {
  userId?: string | null;
  isAllowedToQuery: boolean;
  queryRetryTime: number | null;
  autoTrainingAccess: AutoTrainingAccess | null;
  autoStatisticsAccess: AutoStatisticsAccess | null;
  autoMetricsAccess: AutoMetricsAccess | null;
  querySampleThreshold: number | null;
  validFrom?: string | null;
  validUntil?: string | null;

  cohortId?: number;
}
