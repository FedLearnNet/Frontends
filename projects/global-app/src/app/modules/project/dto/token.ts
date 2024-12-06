import {BaseDto} from "@shared-lib/base/base-dto";

export interface TokenDto extends BaseDto {
  token: string;
  projectId: number;
  site: number;
  siteName?: string;
  isUsed?: boolean;
  message: string;
  progress?: number;
  state: string;
  startedAt?: Date;
  elapsedTime?: number;
}
