export interface StoreFilterParams {
  search?: string | null;
  appTypes?: string[];
  privacyTechniques?: string[];
  minRating?: number | null;
  showUncertified?: boolean;
  hideWorkflow?: boolean;
  onlyTrainedAnalysis?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}
