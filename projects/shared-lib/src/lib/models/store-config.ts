import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";

export interface StoreConfig {
  prefilter: {
    appType: FederatedAppType[];
  };
  allowFilterChange: {
    appType: boolean;
  };
  hideWorkflow?: boolean;
  onlyTrainedAnalysis?: boolean;
}
