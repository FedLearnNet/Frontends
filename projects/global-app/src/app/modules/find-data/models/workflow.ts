import { Application } from '@global-app/find-data/models';

export interface Workflow {
    id: number;
    name: string;
    description: string;
    applications: Application[];
    status: WorkflowStatus;
    approved: {
        datasets: number | null;
        holders: number | null;
    };
}

export enum WorkflowStatus {
    'New',
    'Pending',
    'Completed',
}
