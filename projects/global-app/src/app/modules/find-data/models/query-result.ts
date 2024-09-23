import { QueryResultStatus } from '@global-app/find-data/enums';

export interface QueryResultResponse {
    queries: QueryResult[];
}

export interface QueryResult {
    queryId: string;
    queryString: string;
    result: number;
    status: QueryResultStatus;
}
