export interface VulnerabilitySummaryDTO {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}


export interface SecurityScanResultDTO {
  tool: string;

  target: string;

  success: boolean;


  summary: VulnerabilitySummaryDTO;

  rawReport?: Record<string, unknown>;

}

export interface MalwareFindingDTO {
  filePath: string;
  signature?: string;
  rawLine?: string;
}

export interface SastSummaryDTO {
  error: number;
  warning: number;
  info: number;
  unknown: number;
}

export interface SastFindingDTO {
  ruleId: string;
  severity: 'ERROR' | 'WARNING' | 'INFO' | 'UNKNOWN';
  message: string;
  filePath: string;
  startLine: number;
  endLine?: number;
  startColumn?: number;
  endColumn?: number;
  metadata: Record<string, unknown>;
}

export interface SastScanErrorDTO {
  type: string;
  message: string;
  level?: string;
  code?: number;
  filePath?: string;
}

export interface SastScanResultDTO {
  tool: string;
  version?: string;
  target: string;
  success: boolean;
  complete: boolean;
  scannedFiles?: number;
  summary: SastSummaryDTO;
  findings: SastFindingDTO[];
  errors: SastScanErrorDTO[];
  rawReport?: Record<string, unknown>;
}


export interface MalwareScanResultDTO {
  tool: string;
  success: boolean;
  infectedCount: number;
  findings: MalwareFindingDTO[];
}

export interface AppPublishInfoDTO {
  commitHash?: string;
  imageName?: string;

  // Raw git file links
  filePaths?: string[];

  vulnerabilityScanResult?: SecurityScanResultDTO;

  sastScanResult?: SastScanResultDTO;

  malwareScanResult?: MalwareScanResultDTO;
}
