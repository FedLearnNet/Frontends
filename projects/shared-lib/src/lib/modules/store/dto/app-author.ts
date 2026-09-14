import {BaseDto} from "@shared-lib/base/base-dto";

export interface AuthorDto extends BaseDto {
  federatedAppId: number;
  keycloakId: string;

}
