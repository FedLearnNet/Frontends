export enum ImportStatusEnum {
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
}

export enum ConnectorRunStep {
  INIT = 'INIT',
  EXTRACTING = 'EXTRACTING',
  TRANSFORMING = 'TRANSFORMING',
  MAPPING = 'MAPPING',
  LOADING = 'LOADING',
  FINISHED = 'FINISHED'
}
