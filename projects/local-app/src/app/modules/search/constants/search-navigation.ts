import {BadgeColor} from '@shared-lib/components/badge/badge.component';
import {SearchResultDTO, SearchResultType} from '../dto/search-result';

export interface SearchResultMeta {
  /** Material icon name shown on the card. */
  icon: string;
  /** Badge color for the type chip. */
  color: BadgeColor;
  /** i18n key for the human-readable type label. */
  labelKey: string;
  /**
   * Builds the router commands to navigate to when the result is opened.
   * Returns `null` when the result lacks the data needed to deep-link, in
   * which case the card is rendered as non-navigable.
   */
  route: (item: SearchResultDTO) => any[] | null;
}

/** Per-type map describing how each search result is presented and where it links. */
export const SEARCH_RESULT_MAP: Record<SearchResultType, SearchResultMeta> = {
  [SearchResultType.COHORT]: {
    icon: 'layers',
    color: 'BLUE',
    labelKey: 'SEARCH.TYPE.COHORT',
    route: ({result}) => result.id != null ? ['/cohort', result.id] : ['/cohort'],
  },
  [SearchResultType.PATIENT]: {
    icon: 'personal_injury',
    color: 'GREEN',
    labelKey: 'SEARCH.TYPE.PATIENT',
    route: ({result}) =>
      result.cohortId != null && result.id != null
        ? ['/cohort', result.cohortId, 'patient', result.id]
        : null,
  },
  [SearchResultType.CONNECTOR]: {
    icon: 'cable',
    color: 'ORANGE',
    labelKey: 'SEARCH.TYPE.CONNECTOR',
    route: ({result}) =>
      result.cohortId != null && result.id != null
        ? ['/cohort', result.cohortId, 'connector', 'view', result.id]
        : null,
  },
  [SearchResultType.SCHEMA]: {
    icon: 'account_tree',
    color: 'BLUE',
    labelKey: 'SEARCH.TYPE.SCHEMA',
    route: ({result}) => {
      // ATTRIBUTE/GROUP nodes have a dedicated node-detail page keyed by numeric id;
      // ROOT (or a root schema head) opens the schema detail page keyed by globalId.
      const isNode = result.nodeType != null && result.nodeType !== 'ROOT';
      if (isNode && result.id != null) {
        return ['/schema', 'node', result.id];
      }
      const id = result.globalId ?? result.id;
      return id != null ? ['/schema', id] : ['/schema'];
    },
  },
  [SearchResultType.TRAINING]: {
    icon: 'model_training',
    color: 'GREEN',
    labelKey: 'SEARCH.TYPE.TRAINING',
    route: ({result}) => result.id != null ? ['/training', 'overview', result.id] : ['/training'],
  },
  [SearchResultType.TRAINING_REQUEST]: {
    icon: 'rule',
    color: 'ORANGE',
    labelKey: 'SEARCH.TYPE.TRAINING_REQUEST',
    route: () => ['/data-review/training'],
  },
  [SearchResultType.STATISTICS_REQUEST]: {
    icon: 'analytics',
    color: 'ORANGE',
    labelKey: 'SEARCH.TYPE.STATISTICS_REQUEST',
    route: () => ['/data-review/statistics'],
  },
  [SearchResultType.METRIC_REQUEST]: {
    icon: 'monitoring',
    color: 'ORANGE',
    labelKey: 'SEARCH.TYPE.METRIC_REQUEST',
    route: () => ['/data-review/metrics'],
  },
  [SearchResultType.QUERY]: {
    icon: 'query_stats',
    color: 'GRAY',
    labelKey: 'SEARCH.TYPE.QUERY',
    route: () => ['/logs'],
  },
  [SearchResultType.LOG]: {
    icon: 'description',
    color: 'GRAY',
    labelKey: 'SEARCH.TYPE.LOG',
    route: () => ['/logs'],
  },
};

export function searchResultMeta(type: SearchResultType): SearchResultMeta {
  return SEARCH_RESULT_MAP[type] ?? {
    icon: 'search',
    color: 'GRAY',
    labelKey: 'SEARCH.TYPE.UNKNOWN',
    route: () => null,
  };
}
