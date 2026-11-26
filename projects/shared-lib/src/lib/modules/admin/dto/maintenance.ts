export type MaintenanceMode = 'PREPARE' | 'APPLY' | 'ROLLBACK' | 'BACKUP' | 'RESTORE';

export interface MaintenanceStatusDTO {
  enabled: boolean;
  running?: MaintenanceMode;
  lastLogMessage?: string;
  lastError?: string;
  lastUpgrade?: UpgradeStateDTO;
  // newest first
  backups: BackupDTO[];
}

export interface UpgradeStateDTO {
  step?: MaintenanceMode;
  done: boolean;
  flNetSoftwareVersion?: string;
  lastLogMessage?: string;
  updatedAt?: Date;
}

export interface BackupDTO {
  name: string;
  createdAt?: Date;
  version?: string;
  backUpAll: boolean;
  complete: boolean;
  message?: string;
  // where it is on the server
  path?: string;
}

export interface MaintenanceDTO {
  installedVersion: string;
  targetVersion?: string;
  status: MaintenanceStatusDTO;
}
