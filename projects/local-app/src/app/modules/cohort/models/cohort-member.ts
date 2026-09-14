import {BaseAuthDto} from "@shared-lib/base/base-dto";

export type CohortMemberType = 'MAINTAINER';

export interface CohortMemberDto extends BaseAuthDto {
  cohortId: number;
  type: CohortMemberType;
}

export interface CohortMemberCreateDto {
  cohortId: number;
  keycloakId: string;
  type: CohortMemberType;
}

export interface CohortAvailableUserDto {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}
