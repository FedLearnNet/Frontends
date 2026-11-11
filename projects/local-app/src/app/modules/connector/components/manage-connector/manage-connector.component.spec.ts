import {computed, signal} from '@angular/core';
import {ManageConnectorComponent} from './manage-connector.component';
import {ConnectorStepConfigs} from '../../enum/connector-step-config';
import {ConnectorCard} from '../../models/connector-card';
import {ConnectorDTO} from '../../dto/connector';

describe('ManageConnectorComponent wizard steps', () => {
  let component: ManageConnectorComponent;

  beforeEach(() => {
    component = Object.create(ManageConnectorComponent.prototype);
    component.cards = [
      {
        index: 0,
        title: 'Source',
        step: ConnectorStepConfigs.STEP_SOURCE_CONFIG,
        type: 'CONFIG',
      },
      {
        index: 1,
        title: 'File Import Settings',
        step: ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
        type: 'CONFIG',
      },
    ];
    const transformers = signal(new Map());
    Object.assign(component, {
      transformers,
      transformerList: computed(() => Array.from(transformers().values())),
    });
    component.disableAddTransformer = true;
    (component as any).translate = {instant: (key: string) => key};
  });

  it('adds the specify-header step when uploaded file info becomes available', () => {
    component._config = configWithFileInfo();

    expect(component.canShowDownstreamSteps()).toBeFalse();

    (component as any).syncCardState();

    expect(component.cards[2].step).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
    expect(component.cards[2].title.trim()).toBe('SPECIFY_HEADER');
    expect(component.canShowDownstreamSteps()).toBeTrue();
  });

  it('inserts the specify-header step before an existing transformer', () => {
    const transformerCard: ConnectorCard = {
      index: 2,
      id: 'transform-1',
      title: 'Transformer',
      step: ConnectorStepConfigs.TRANSFORM,
      type: 'TRANSFORM',
    };
    component.cards.push(transformerCard);
    component._config = configWithFileInfo();

    (component as any).syncCardState();

    expect(component.cards.map(card => card.step)).toEqual([
      ConnectorStepConfigs.STEP_SOURCE_CONFIG,
      ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
      ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
      ConnectorStepConfigs.TRANSFORM,
    ]);
    expect(component.cards[3]).toBe(transformerCard);
    expect(component.cards.map(card => card.index)).toEqual([0, 1, 2, 3]);
  });

  it('gives the mapper the Specify Headers columns with the merge UID column first', () => {
    component._config = {
      mergeConfig: {uidColumn: 'patient_id', sheetUidMapping: {}, commonUidColumnName: 'Patient ID'},
      fileInfo: {
        Merged: {
          columns: ['age', 'Patient ID', 'weight'],
          renamedColumns: ['age', 'Patient ID', 'weight'],
          deletedColumns: [false, false, false],
          json: '[]',
        },
      },
    } as unknown as ConnectorDTO;
    component.transformedData = new Map();

    expect(component.getMapperColumns()).toEqual(['Patient ID', 'age', 'weight']);
  });

  it('takes the transformed columns in the order the preview sent, also for number-like names', () => {
    const step = {index: component.cards.length, title: 'step', configured: true, optional: true,
      step: ConnectorStepConfigs.TRANSFORM, type: 'TRANSFORM', id: 't1', previewRunning: false} as ConnectorCard;
    component._config = {} as ConnectorDTO;
    component.cards = [...component.cards, step];
    component.currentStep = step;
    // A parsed row lists "2019" first; the preview's column list keeps the real order.
    component.transformedData = new Map([['t1', [{patient_id: 'p1', '2019': 5, bmi: 22}]]]);
    component.transformedColumns = new Map([['t1', ['patient_id', '2019', 'bmi']]]);

    expect(component.getLatestColumns()).toEqual(['patient_id', '2019', 'bmi']);
    expect(component.getCurrentStepColumns()).toEqual(['patient_id', '2019', 'bmi']);
  });

  function configWithFileInfo(): ConnectorDTO {
    return {
      inputConfig: {
        mode: 'FILE',
        fileType: 'CSV',
        fileId: 42,
      },
      fileInfo: {
        '0': {
          sheet: '0',
          columns: ['patient_id'],
          renamedColumns: ['patient_id'],
          deletedColumns: [false],
          json: [{patient_id: '1'}],
        },
      },
    } as unknown as ConnectorDTO;
  }
});
