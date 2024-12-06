import {BaseDto} from "@shared-lib/base/base-dto";


export interface WorkflowElementDto extends BaseDto {

  projectId: number;
  federatedAppId: number;
  federatedAppVersionId: number;
  orderValue: number;

  hyperParams?: { [key: string]: any };

  //TODO MAKE THIS VIA API NOT DUMMY
  isPrivateApp?: boolean;
  isPlugin?: boolean;
}
