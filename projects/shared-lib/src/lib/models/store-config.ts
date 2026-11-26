import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";

export interface StoreConfig {
  prefilter: {
    appType: FederatedAppType[];
  };
  allowFilterChange: {
    appType: boolean;
  };
  // selectable app types in the filter, defaults to the prefilter
  filterAppTypes?: FederatedAppType[];
  hideWorkflow?: boolean;
  onlyTrainedAnalysis?: boolean;
  // hides tools without image and workflows containing one
  onlyWithImage?: boolean;
}
