import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey, NotificationState} from './notification.reducer';
import {NotificationStatus} from '@shared-lib/base/notifications';

export const selectFeature = createFeatureSelector<NotificationState>(featureKey);

export const selectItems = createSelector(selectFeature, s => s.items);
export const selectLoading = createSelector(selectFeature, s => s.loading);
export const selectError = createSelector(selectFeature, s => s.error);
export const selectReviewCounts = createSelector(selectFeature, s => s.reviewCounts);

/** Anything not yet read and not archived counts as "unread / new". */
export const isUnread = (status: NotificationStatus | undefined): boolean =>
  status !== NotificationStatus.READ && status !== NotificationStatus.ARCHIVED;

export const selectUnread = createSelector(selectItems, items =>
  items.filter(i => isUnread(i.status))
);

export const selectUnreadCount = createSelector(selectUnread, list => list.length);

export const selectByStatus = (status: NotificationStatus | 'ALL' | 'UNREAD') =>
  createSelector(selectItems, items => {
    if (status === 'ALL') return items;
    if (status === 'UNREAD') return items.filter(i => isUnread(i.status));
    return items.filter(i => i.status === status);
  });
