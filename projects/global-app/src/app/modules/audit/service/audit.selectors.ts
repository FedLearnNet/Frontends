import {createFeatureSelector, createSelector} from '@ngrx/store';
import {AuditState, featureKey} from "./audit.reducer";

export const selectAuditState = createFeatureSelector<AuditState>(featureKey);

export const selectAuditError =
  createSelector(selectAuditState, (s) => s.error ?? null);

export const selectAuditCreateLoading =
  createSelector(selectAuditState, (s) => s.createLoading);

export const selectAuditSelectedId =
  createSelector(selectAuditState, (s) => s.selectedId ?? null);

export const selectAuditSelectedLoading =
  createSelector(selectAuditState, (s) => s.selectedLoading);


export const selectAuditPending =
  createSelector(selectAuditState, (s) => s.pending);

export const selectAuditPendingLoading =
  createSelector(selectAuditState, (s) => s.pendingLoading);



export const selectAuditByIdMap =
  createSelector(selectAuditState, (s) => s.byId);

export const selectAuditById = (id: number) =>
  createSelector(selectAuditByIdMap, (byId) => byId[id]);


export const selectAuditsByVersionId =
  createSelector(selectAuditState, (s) => s.auditsByVersionId);

