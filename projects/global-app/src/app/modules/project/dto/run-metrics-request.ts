import {BaseDto} from '@shared-lib/base/base-dto';
import {RunMessageMetricDTO} from '@shared-lib/modules/experiments/dto/log';

export enum RunMetricsRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
}

// Metrics the apps reported, or the outputs of a TRE run.
export type RunMetricsRequestType = 'METRICS' | 'OUTPUTS';

export interface RunMetricsRequestDto extends BaseDto {
  type?: RunMetricsRequestType;
  experimentId: number;
  projectId: number;
  status: RunMetricsRequestStatus;
  requestKeycloakId: string;
  globalRequestId: string;
  responsesReceived: number;
  totalParticipants: number;

  responses: RunMetricsResponseDto[];
}

export interface RunMetricsResponseDto extends BaseDto {
  requestId: number;
  randomClinicId: string;
  metrics: RunMessageMetricDTO[];
}

export interface EvaluationMetricComparison {
  metric: string;
  localMean: number | null;
  federated: number | null;
  benefit: number | null;
  federatedMin: number | null;
  federatedMax: number | null;
  federatedSd: number | null;
}

export interface EvaluationRoundPoint {
  round: number;
  value: number;
}

export interface EvaluationSiteSummary {
  clinicId: string;
  ntrain: number | null;
  nval: number | null;
  positiveRate: number | null;
  federated: Record<string, number>;
  local: Record<string, number>;
}

export interface EvaluationRoundTiming {
  round: number;
  roundSeconds: number | null;
  commSeconds: number | null;
  cumulativeSeconds: number | null;
}

export interface EvaluationScalability {
  avgRoundSeconds: number | null;
  totalRoundSeconds: number | null;
  avgCommSeconds: number | null;
  totalCommSeconds: number | null;
  paramsPerRound: number | null;
  timings: EvaluationRoundTiming[];
}

export interface EvaluationSummaryDto {
  primaryMetric: string;
  metricNames: string[];
  rounds: number;
  siteCount: number;
  securedCounts: boolean;
  convergenceRound: number | null;
  comparison: EvaluationMetricComparison[];
  convergence: EvaluationRoundPoint[];
  sites: EvaluationSiteSummary[];
  scalability: EvaluationScalability | null;
}
