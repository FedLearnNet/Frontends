import { CohortDetail } from '@local-app/data-review/models/cohort-detail';
import { WorkflowDetail } from '@local-app/data-review/models/workflow-detail';

export interface Training {
    id: number;
    user: number | string;
    requestedData: CohortDetail[];
    workflow: WorkflowDetail,
    description: string;
    date: Date,
    status: TrainingStatus | string;
}

export enum TrainingStatus {
    'Pending',
    'Completed',
    'Rejected',
}
