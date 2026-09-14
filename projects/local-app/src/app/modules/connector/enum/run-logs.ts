export enum RunLogsType {
  ERROR,
  RUN_ERROR,
  HARMONIZER
}

export function mapNumericTypeToRunLogsType(type: number | RunLogsType): RunLogsType {
  if (typeof type === 'number') {
    switch (type) {
      case 0:
        return RunLogsType.ERROR;
      case 1:
        return RunLogsType.RUN_ERROR;
      case 2:
        return RunLogsType.HARMONIZER;
      default:
        return RunLogsType.ERROR;
    }
  }
  return type;
}
