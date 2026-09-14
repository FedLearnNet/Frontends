import {getAggregatorLocation} from './learning-request-data-selector-list.component';

describe('LearningRequestDataSelectorListComponent', () => {
  it('describes the connected FL-Net Platform as the aggregator', () => {
    expect(getAggregatorLocation(true))
      .toBe('The FL-Net Platform connected to this clinic');
  });

  it('describes a randomly selected client as the aggregator', () => {
    expect(getAggregatorLocation(false))
      .toBe('Another participating client (selected randomly)');
  });
});
