import {BaseAuthDto} from "@shared-lib/base/base-dto";

export interface StoreRatingDTO extends BaseAuthDto {
  modelVersionId?: number
  federatedAppId?: number;
  rating: number;
  reviewText: string;
}

export interface StoreRatingCreateDTO {
  rating: number;
  reviewText: string;
}
