import {FunctionExecutionMode} from '../../../../../dto/function';

export function modeIcon(mode?: FunctionExecutionMode | null): string {
  switch (mode) {
    case FunctionExecutionMode.CELL:
      return 'grid_view';
    case FunctionExecutionMode.ROW:
      return 'table_rows';
    case FunctionExecutionMode.PATIENT:
      return 'person';
    default:
      return 'apps';
  }
}

export function modeLabelKey(mode?: FunctionExecutionMode | null): string {
  switch (mode) {
    case FunctionExecutionMode.CELL:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_CELL';
    case FunctionExecutionMode.ROW:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_ROW';
    case FunctionExecutionMode.PATIENT:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_PATIENT';
    default:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_ALL';
  }
}

export function modeDescriptionKey(mode?: FunctionExecutionMode | null): string {
  switch (mode) {
    case FunctionExecutionMode.CELL:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_CELL_DESCRIPTION';
    case FunctionExecutionMode.ROW:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_ROW_DESCRIPTION';
    case FunctionExecutionMode.PATIENT:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_PATIENT_DESCRIPTION';
    default:
      return 'DIALOG.TRANSFORMER_MANAGER.MODE_ALL_DESCRIPTION';
  }
}
