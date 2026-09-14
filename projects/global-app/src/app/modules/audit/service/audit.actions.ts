import {createActionGroup, emptyProps, props} from "@ngrx/store";
import {ToolAuditCombinationDTO, ToolAuditCreateDTO, ToolAuditDTO, ToolAuditPendingDTO} from "../dto/audit";

export const AuditActions = createActionGroup({
  source: 'Audit',
  events: {
    'Load Pending': emptyProps(),
    'Load Pending Success': props<{ rows: ToolAuditPendingDTO[] }>(),
    'Load Pending Failure': props<{ error: string }>(),

    'Load By Version': props<{ appVersionId: number }>(),
    'Load By Version Success': props<{ appVersionId: number; audit: ToolAuditCombinationDTO }>(),
    'Load By Version Failure': props<{ appVersionId: number; error: string }>(),

    'Load By Id': props<{ id: number }>(),
    'Load By Id Success': props<{ audit: ToolAuditDTO }>(),
    'Load By Id Failure': props<{ id: number; error: string }>(),

    'Create': props<{ dto: ToolAuditCreateDTO }>(),
    'Create Success': props<{ created: ToolAuditDTO }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ id: number; dto: ToolAuditDTO }>(),
    'Update Success': props<{ updated: ToolAuditDTO }>(),
    'Update Failure': props<{ id: number; error: string }>(),

    'Delete': props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ id: number; error: string }>(),
  },
});
