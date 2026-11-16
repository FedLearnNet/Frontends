export type PatientToolRunStatus =
  'PENDING' | 'INITIALIZED' | 'STARTED' | 'RUNNING' | 'FINISHED' | 'STOPPED' | 'ERROR';

export function isTerminalRunStatus(status?: PatientToolRunStatus | string | null): boolean {
  return status === 'FINISHED' || status === 'ERROR' || status === 'STOPPED';
}
