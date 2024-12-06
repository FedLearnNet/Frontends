export interface Permission {
  id?: string;
  cohortId: string | null;
  userId?: string | null;
  groupId?: string | null;
  isAllowedToQuery: boolean;
  queryRetryTime: number | null;
  autoTrainingAccess: string | null;
  querySampleThreshold: number | null;
  createdAt?: string;
  updatedAt?: string;
}