import {ToolAuditCombinationDTO, ToolAuditDTO, ToolAuditPendingDTO} from "../dto/audit";

import {createReducer, on} from '@ngrx/store';
import {AuditActions} from './audit.actions';

export interface AuditState {
  pending: ToolAuditPendingDTO[];
  pendingLoading: boolean;

  auditsByVersionId?: ToolAuditCombinationDTO;

  byId: Record<number, ToolAuditDTO>;
  selectedId?: number | null;
  selectedLoading: boolean;

  createLoading: boolean;
  error?: string | null;
}

export const initialAuditState: AuditState = {
  pending: [],
  pendingLoading: false,

  byId: {},
  selectedId: null,
  selectedLoading: false,

  createLoading: false,
  error: null,
};

export const featureKey = 'audit';


export const auditReducer = createReducer(
  initialAuditState,
  on(AuditActions.loadPending, (s): AuditState => ({...s, pendingLoading: true, error: null})),
  on(AuditActions.loadPendingSuccess, (s, {rows}): AuditState => ({...s, pendingLoading: false, pending: rows})),
  on(AuditActions.loadPendingFailure, (s, {error}): AuditState => ({...s, pendingLoading: false, error})),

  on(AuditActions.loadByVersion, (s): AuditState => ({
    ...s,
    selectedLoading: true,
    error: null,
  })),
  on(AuditActions.loadByVersionSuccess, (s, {audit}): AuditState => ({
    ...s,
    selectedLoading: false,
    auditsByVersionId: audit,
  })),
  on(AuditActions.loadByVersionFailure, (s, {error}): AuditState => ({
    ...s,
    selectedLoading: false,
    error,
  })),

  // NEW: loadById
  on(AuditActions.loadById, (s, {id}): AuditState => ({
    ...s,
    selectedId: id,
    selectedLoading: true,
    error: null,
  })),
  on(AuditActions.loadByIdSuccess, (s, {audit}): AuditState => ({
    ...s,
    selectedLoading: false,
    byId: {...s.byId, [audit.id!]: audit},
  })),
  on(AuditActions.loadByIdFailure, (s, {error}): AuditState => ({
    ...s,
    selectedLoading: false,
    error,
  })),

  on(AuditActions.create, (s): AuditState => ({...s, createLoading: true, error: null})),
  on(AuditActions.createSuccess, (s, {created}): AuditState => {
    const versionId = created.appVersionId;
    const isLatestVersion = s.auditsByVersionId?.appDetail.latestVersionId === versionId;

    const auditsByVersionId = (isLatestVersion && s.auditsByVersionId)
      ? ({...s.auditsByVersionId, audit: created} as ToolAuditCombinationDTO)
      : s.auditsByVersionId;

    return {
      ...s,
      createLoading: false,
      byId: created.id ? {...s.byId, [created.id]: created} : s.byId,
      auditsByVersionId,
    };
  }),
  on(AuditActions.createFailure, (s, {error}): AuditState => ({...s, createLoading: false, error})),

  on(AuditActions.updateSuccess, (s, {updated}): AuditState => {
    const id = updated.id!;
    const versionId = updated.appVersionId;
    const isLatestVersion = s.auditsByVersionId?.appDetail.latestVersionId === versionId;

    const auditsByVersionId = (isLatestVersion && s.auditsByVersionId)
      ? ({...s.auditsByVersionId, audit: updated} as ToolAuditCombinationDTO)
      : s.auditsByVersionId;

    return {
      ...s,
      byId: {...s.byId, [id]: updated},
      auditsByVersionId,
    };
  }),

  on(AuditActions.deleteSuccess, (s, {id}): AuditState => {
    const byId = {...s.byId};
    delete byId[id];
    let auditsByVersionId = s.auditsByVersionId;
    if (s.auditsByVersionId?.audit?.id === id) {
      auditsByVersionId = undefined;
    }
    return {...s, byId, auditsByVersionId};
  })
);
