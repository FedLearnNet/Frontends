import {BaseAuthDto} from "@shared-lib/base/base-dto";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";

export type AuditDecision = 'ACCEPT' | 'REJECT';

export interface ToolAuditDTO extends BaseAuthDto {
  appVersionId: number;
  decision?: AuditDecision | null;
  reason?: string | null;
}

export interface ToolAuditCreateDTO {
  appVersionId: number;
  decision?: AuditDecision | null;
  reason?: string | null;
}

export interface ToolAuditPendingDTO {
  appDetail: AppDetailDto;
  openCount: number;
}


export interface ToolAuditCombinationDTO {
  appDetail: AppDetailDto;
  audit?: ToolAuditDTO | null;
}
