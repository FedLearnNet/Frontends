import { Workflow } from '@global-app/find-data/models';

export interface Query {
    id: number;
    name: string;
    description: string;
    queryString: string;
    result: {
        datasets: number | null;
        holders: number | null;
    };
    workflows: Workflow[],
}
