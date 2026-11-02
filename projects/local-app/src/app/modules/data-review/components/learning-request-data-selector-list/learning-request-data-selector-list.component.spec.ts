import {getAggregatorLocationKey} from './learning-request-data-selector-list.component';

describe('LearningRequestDataSelectorListComponent', () => {
  it('resolves the platform-aggregator i18n key when the platform is the aggregator', () => {
    expect(getAggregatorLocationKey(true))
      .toBe('DIALOG.CREATE_NEW_PROJECT.AGGREGATOR_LOCATION_PLATFORM');
  });

  it('resolves the random-clinic i18n key when a clinic is the aggregator', () => {
    expect(getAggregatorLocationKey(false))
      .toBe('DIALOG.CREATE_NEW_PROJECT.AGGREGATOR_LOCATION_RANDOM_CLINIC');
  });
});
