import {
  DATASET_SELECTION_TRANSFER_TYPE,
  readDatasetSelectionTransfer,
  writeDatasetSelectionTransfer
} from './dataset-drag-drop.util';

describe('dataset drag and drop transfer', () => {
  const selection = {
    globalOntologyId: 'ontology-1',
    globalDataTypeId: 'datatype-1',
  };

  it('writes a standard text fallback and reads it back', () => {
    const values = new Map<string, string>();
    const dataTransfer = {
      setData: (type: string, value: string) => values.set(type, value),
      getData: (type: string) => values.get(type) ?? '',
    };

    writeDatasetSelectionTransfer(dataTransfer, selection);

    expect(values.get(DATASET_SELECTION_TRANSFER_TYPE)).toBe(JSON.stringify(selection));
    expect(values.get('text/plain')).toBe(JSON.stringify(selection));
    expect(readDatasetSelectionTransfer(dataTransfer)).toEqual(selection);
  });

  it('reads a valid selection from the text fallback', () => {
    const dataTransfer = {
      getData: (type: string) => type === 'text/plain' ? JSON.stringify(selection) : '',
    };

    expect(readDatasetSelectionTransfer(dataTransfer)).toEqual(selection);
  });

  it('rejects non-selection and malformed payloads', () => {
    expect(readDatasetSelectionTransfer({getData: () => 'BMI'})).toBeNull();
    expect(readDatasetSelectionTransfer({
      getData: () => JSON.stringify({globalOntologyId: 'ontology-1'}),
    })).toBeNull();
  });
});
