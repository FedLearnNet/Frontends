import {BadgeColor} from '@shared-lib/components/badge/badge.component';
import {QueryDTO} from '@global-app/find-data/dto/query';

export type QueryRunStatus = 'draft' | 'pending' | 'finished' | 'failed';

type QueryStatusFields = Pick<QueryDTO, 'hasFired' | 'hasResult'> & {
  result?: number | null;
  error?: string | null;
};

const STATUS_COLOR: Record<QueryRunStatus, BadgeColor> = {
  draft: 'GRAY',
  pending: 'BLUE',
  finished: 'GREEN',
  failed: 'RED',
};

export function queryHasPatientCount(query: QueryStatusFields): boolean {
  return query.hasResult && typeof query.result === 'number' && Number.isFinite(query.result);
}

export function queryStatus(query: QueryStatusFields): QueryRunStatus {
  if (queryHasPatientCount(query)) {
    return 'finished';
  }
  if (query.error?.trim() || query.hasResult) {
    return 'failed';
  }
  if (query.hasFired) {
    return 'pending';
  }
  return 'draft';
}

export function queryStatusColor(query: QueryStatusFields): BadgeColor {
  return STATUS_COLOR[queryStatus(query)];
}

export function queryStatusKey(status: QueryRunStatus): string {
  return `QUERY_STATUS.${status.toUpperCase()}`;
}
