import {createReducer, on} from '@ngrx/store';
import {NotificationActions} from './notification.actions';
import {NotificationDTO} from '@shared-lib/base/notifications';

export interface ReviewCounts {
  training: number;
  statistics: number;
  metrics: number;
}

export interface NotificationState {
  items: NotificationDTO[];
  reviewCounts: ReviewCounts;
  loading: boolean;
  error: any;
  errorById: { [id: number]: any };
}

export const initialNotificationState: NotificationState = {
  items: [],
  reviewCounts: {training: 0, statistics: 0, metrics: 0},
  loading: false,
  error: null,
  errorById: {},
};

export const featureKey = 'notifications';

function replace(items: NotificationDTO[], updated: NotificationDTO): NotificationDTO[] {
  const idx = items.findIndex(i => i.id === updated.id);
  if (idx < 0) return [updated, ...items];
  const copy = items.slice();
  copy[idx] = updated;
  return copy;
}

export const notificationReducer = createReducer(
  initialNotificationState,

  on(NotificationActions.loadAll, (state): NotificationState => ({
    ...state, loading: true, error: null,
  })),
  on(NotificationActions.loadAllSuccess, (state, {items}): NotificationState => ({
    ...state, items, loading: false, error: null,
  })),
  on(NotificationActions.loadAllFailure, (state, {error}): NotificationState => ({
    ...state, loading: false, error,
  })),

  on(NotificationActions.loadUserInfoSuccess, (state, {info}): NotificationState => ({
    ...state,
    items: info.notifications ?? [],
    reviewCounts: {
      training: info.openTrainingRequests ?? 0,
      statistics: info.openStatisticsRequests ?? 0,
      metrics: info.openMetricsRequests ?? 0,
    },
    loading: false,
    error: null,
  })),
  on(NotificationActions.loadUserInfoFailure, (state, {error}): NotificationState => ({
    ...state, loading: false, error,
  })),

  on(NotificationActions.markAsReadSuccess, (state, {updated}): NotificationState => ({
    ...state, items: replace(state.items, updated),
    errorById: {...state.errorById, [updated.id]: null},
  })),
  on(NotificationActions.markAsReadFailure, (state, {id, error}): NotificationState => ({
    ...state, errorById: {...state.errorById, [id]: error},
  })),

  on(NotificationActions.archiveSuccess, (state, {updated}): NotificationState => ({
    ...state, items: replace(state.items, updated),
    errorById: {...state.errorById, [updated.id]: null},
  })),
  on(NotificationActions.archiveFailure, (state, {id, error}): NotificationState => ({
    ...state, errorById: {...state.errorById, [id]: error},
  })),

  on(NotificationActions.deleteSuccess, (state, {id}): NotificationState => ({
    ...state, items: state.items.filter(i => i.id !== id),
    errorById: {...state.errorById, [id]: null},
  })),
  on(NotificationActions.deleteFailure, (state, {id, error}): NotificationState => ({
    ...state, errorById: {...state.errorById, [id]: error},
  })),

  on(NotificationActions.resetErrors, (state): NotificationState => ({
    ...state, error: null, errorById: {},
  })),
);
