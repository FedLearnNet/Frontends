import { CohortDetail } from '@local-app/data-review/models/cohort-detail';
import { WorkflowDetail } from '@local-app/data-review/models/workflow-detail';

export interface Training {
    flRequestId: string;
    platformUserId: number | string;
    requestData: CohortDetail[];
    flAppWorkflow: WorkflowDetail[],
    description: string;
    flRequestStatus: TrainingStatus | string;
    createdAt: Date,
    updatedAt: Date,
    queryId: string,
}

export enum TrainingStatus {
    'Pending' = 'Pending',
    'Completed' = 'Completed',
    'Rejected' = 'Rejected',
    'Approved' = 'Approved',
    'Running' = 'Running',
}
