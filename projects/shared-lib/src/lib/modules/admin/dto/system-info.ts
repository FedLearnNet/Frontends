export interface SystemComputingInfoReducedDTO {
  cpuDetails?: {modelName: string; logicalCores: number; architecture: string};
  ramDetails?: {totalMemoryGb: number};
  gpuHardwareInfo?: {name: string; totalMemory: string}[];
}

export interface SystemComputingInfoDTO extends SystemComputingInfoReducedDTO {
  flNetSoftwareVersion?: string;
  gpuAvailable: boolean;
  cpuDetails?: {modelName: string; logicalCores: number; architecture: string;
    usedCores: number; freeCores: number; usagePercent: number};
  ramDetails?: {totalMemoryGb: number; usedMemoryGb: number; availableMemoryGb: number};
  gpuHardwareInfo?: {index: number; name: string; driverVersion: string; totalMemory: string;
    usedMemory: string; computeUtilization: string; memoryUtilization: string}[];
}

export interface QueryPartnerSystemDTO {
  id: number;
  system?: SystemComputingInfoReducedDTO;
  supportedModes?: ('FEDERATED' | 'TRE')[];
  // only sent when the client allows TRE
  count?: number;
  // Keycloak name of the client, only when it allows TRE and shares it
  clientName?: string;
}
