import {BaseDto} from "@shared-lib/base/base-dto";

export interface OntologyDto extends BaseDto {
  name: string;
  description: string;

  globalId?: string;
  rootSource?: string;
}

