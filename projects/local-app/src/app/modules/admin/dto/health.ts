export type UpDownUnknown = 'UP' | 'DOWN' | 'UNKNOWN';

export interface HealthCheckDto {
  name: string;
  status: UpDownUnknown;
  data?: Record<string, any>;
}
export interface HealthResponseDto {
  status: UpDownUnknown;
  checks: HealthCheckDto[];
}
