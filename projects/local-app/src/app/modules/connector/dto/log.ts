export interface RunLogDTO {
  id: number,
  createdAt: string,
  updatedAt: string,
  message: string,
  level: string,
  runId: number
}


export interface RunErrorLogDTO extends RunLogDTO {
  patientId?: string,
  field?: string,
  logType: string
}


export interface RunChangeLogDTO {
  field: string,
  previous: any,
  current: any
}
export interface RunChangesLogDTO {
  patientId: string,
  status: string,
  diffs: RunChangeLogDTO[]
}

export interface RunChangesOverviewLogDTO {
  count: number,
  results: RunChangesLogDTO[]
}
