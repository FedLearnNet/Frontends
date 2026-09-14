import {SelectedDataIdsDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";

export const DATASET_SELECTION_TRANSFER_TYPE = 'application/x-patient-export-selection';

export function writeDatasetSelectionTransfer(
  dataTransfer: Pick<DataTransfer, 'setData'>,
  selection: SelectedDataIdsDTO
): void {
  const payload = JSON.stringify(selection);
  dataTransfer.setData(DATASET_SELECTION_TRANSFER_TYPE, payload);
  // Some browsers only expose standard transfer types to a drop target.
  dataTransfer.setData('text/plain', payload);
}

export function readDatasetSelectionTransfer(
  dataTransfer: Pick<DataTransfer, 'getData'> | null | undefined
): SelectedDataIdsDTO | null {
  if (!dataTransfer) {
    return null;
  }

  const payload = dataTransfer.getData(DATASET_SELECTION_TRANSFER_TYPE)
    || dataTransfer.getData('text/plain');

  if (!payload) {
    return null;
  }

  try {
    const selection = JSON.parse(payload) as Partial<SelectedDataIdsDTO>;
    if (
      typeof selection.globalOntologyId !== 'string'
      || !selection.globalOntologyId
      || typeof selection.globalDataTypeId !== 'string'
      || !selection.globalDataTypeId
    ) {
      return null;
    }

    return {
      globalOntologyId: selection.globalOntologyId,
      globalDataTypeId: selection.globalDataTypeId,
    };
  } catch {
    return null;
  }
}
