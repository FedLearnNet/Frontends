export interface BaseDto {
  id: number,
  version: number,
  createdAt: Date,
  updatedAt: Date,
}

export interface BaseAuthDto extends BaseDto {
  keycloakId: string;
}


export interface BaseValidationResultDTO {
  ok: boolean;
  errors: string[];
  meta?: Record<string, any>;
}
