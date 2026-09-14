import {BaseDto} from "@shared-lib/base/base-dto";
import {QueryabilityOption} from "@local-app/cohort/enums";

export interface CohortQueryabilityDTO extends BaseDto {
  queryAbilityInfo: QueryabilityOption;
  cohortId?: number;
  schemaNodeId: number;
}
