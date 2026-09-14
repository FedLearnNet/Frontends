import {BaseDto} from "@shared-lib/base/base-dto";

export interface InfoDTO {
  Architecture?: string;
  CPUSet?: boolean;
  CPUShares?: boolean;
  Containers?: number;
  ContainersPaused?: number;
  ContainersRunning?: number;
  ContainersStopped?: number;
  CpuCfsPeriod?: boolean;
  CpuCfsQuota?: boolean;
  Debug?: boolean;
  DockerRootDir?: string;
  Driver?: string;
  DriverStatus?: string[][];
  ExperimentalBuild?: boolean;
  HttpProxy?: string;
  HttpsProxy?: string;
  ID?: string;
  IPv4Forwarding?: boolean;
  Images?: number;
  IndexServerAddress?: string;
  Isolation?: string;
  KernelVersion?: string;
  Labels?: string[];
  LoggingDriver?: string;
  MemTotal?: number;
  MemoryLimit?: boolean;
  NCPU?: number;
  NEventsListener?: number;
  NFd?: number;
  NGoroutines?: number;
  Name?: string;
  NoProxy?: string;
  OSType?: string;
  OomKillDisable?: boolean;
  OperatingSystem?: string;
  Plugins?: {
    Authorization?: string[] | null;
    Volume?: string[] | null;
    Log?: string[] | null;
    Network?: string[] | null;
  };
  RegistryConfig?: {
    IndexConfigs?: Record<string, {
      Mirrors?: string[];
      Name?: string;
      Official?: boolean;
      Secure?: boolean;
    }>;
    InsecureRegistryCIDRs?: string[];
  };
  Runtimes?: Record<string, { path?: string }>;
  SecurityOptions?: string[];
  ServerVersion?: string;
  SwapLimit?: boolean;
  SystemTime?: string;
}


export interface ContainerDTO {
  Command?: string;
  Created?: number; // Unix epoch seconds
  HostConfig?: { NetworkMode?: string };
  Id: string;
  Image?: string;
  ImageID?: string;
  Labels?: Record<string, string>;
  Mounts?: Array<{
    Destination?: string;
    Driver?: string;
    Mode?: string;
    Name?: string;
    Propagation?: string;
    RW?: boolean;
    Source?: string;
  }>;
  Names?: string[];
  NetworkSettings?: {
    Networks?: Record<string, {
      EndpointID?: string;
      Gateway?: string;
      GlobalIPv6Address?: string;
      GlobalIPv6PrefixLen?: number;
      IPAddress?: string;
      IPPrefixLen?: number;
      IPv6Gateway?: string;
      MacAddress?: string;
      NetworkID?: string;
    }>;
  };
  Ports?: Array<{
    IP?: string;
    PrivatePort?: number;
    PublicPort?: number;
    Type?: string;
  }>;
  State?: string;  // "running", "exited", ...
  Status?: string; // human readable (e.g., "Up 4 minutes")
}

export interface InspectVolumeResponseDTO {
  name?: string;
  driver?: string;
  mountpoint?: string;
  scope?: string;
  labels?: Record<string, string> | null;
  options?: Record<string, string> | null;
  usageData?: {
    size?: number;
    refCount?: number;
  } | null;
}

export interface ContainerRunDTO extends BaseDto{
  appId?: number;
  appImage?: string;
  workflowId?: number;
  workflowStep?: number;
  workflowMaxSteps?: number;
  containerName?: string;
  containerId?: string;
  status?: ContainerRunStatus;
}

export type ContainerRunStatus =
  | 'CREATED'
  | 'RUNNING'
  | 'FAILED'
  | 'FINISHED'
  | 'STOPPED'
  | 'UNKNOWN';

export interface ContainerLogDTO extends BaseDto {
  appId?: number;
  appImage?: string;
  workflowId?: number;
  workflowStep?: number;
  workflowMaxSteps?: number;
  containerName?: string;
  containerId?: string;
  log?: string;
}
