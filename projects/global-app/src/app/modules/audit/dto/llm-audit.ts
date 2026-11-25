import {BaseDto} from "@shared-lib/base/base-dto";

export type LlmAuditStatus = 'PENDING' | 'RUNNING' | 'FINISHED' | 'FAILED';
export type LlmAuditVerdict = 'SAFE' | 'SAFE_WITH_CONCERNS' | 'UNSAFE' | 'INCONCLUSIVE';
export type LlmAuditSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface LlmAuditFinding {
  category: string;
  severity: LlmAuditSeverity;
  title: string;
  description?: string;
  filePath?: string | null;
  line?: number | null;
  evidence?: string | null;
  source?: string | null;
  recommendation?: string | null;
}

export interface LlmAuditReport {
  verdict: LlmAuditVerdict;
  riskLevel: LlmAuditSeverity;
  clinicianSummary?: string;
  technicalSummary?: string;
  dataFlowSummary?: string;
  findings: LlmAuditFinding[];
  positives: string[];
  limitations: string[];
}

export interface LlmAuditDTO extends BaseDto {
  appVersionId: number;
  status: LlmAuditStatus;
  commitHash?: string | null;
  verdict?: LlmAuditVerdict | null;
  riskLevel?: LlmAuditSeverity | null;
  report?: LlmAuditReport | null;
  errorMessage?: string | null;
  modelName?: string | null;
  sourceAvailable: boolean;
  sourceTruncated: boolean;
  reviewedFiles: number;
  totalFiles: number;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export interface LlmAuditQuotaDTO {
  enabled: boolean;
  unlimited: boolean;
  limit: number;
  used: number;
  remaining: number;
  nextSlotAt?: string | null;
}
