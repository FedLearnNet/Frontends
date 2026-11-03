import {BadgeColor} from '@shared-lib/components/badge/badge.component';
import {QueryDTO} from '@global-app/find-data/dto/query';

export type QueryRunStatus = 'draft' | 'pending' | 'finished' | 'failed';

type QueryStatusFields = Pick<QueryDTO, 'hasFired' | 'hasResult'> & {error?: string | null};

const STATUS_COLOR: Record<QueryRunStatus, BadgeColor> = {
  draft: 'GRAY',
  pending: 'BLUE',
  finished: 'GREEN',
  failed: 'RED',
};

export function queryStatus(query: QueryStatusFields): QueryRunStatus {
  if (query.error?.trim()) {
    return 'failed';
  }
  if (query.hasResult) {
    return 'finished';
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
