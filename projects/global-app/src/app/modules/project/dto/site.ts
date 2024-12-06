import {BaseDto} from "@shared-lib/base/base-dto";

export interface SiteDto extends BaseDto {
  name: string;
  organization: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  phone: string;
  token?: string;
}
