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

  malwareScanResult?: MalwareScanResultDTO;
}
