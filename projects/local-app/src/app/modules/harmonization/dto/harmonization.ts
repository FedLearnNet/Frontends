import {BaseDto} from '@shared-lib/base/base-dto';
import {DataTypeDto} from '../../cohort/dto/data-type';
import {ConnectorMappingDTO, ConnectorTransformerDTO} from '../../connector/dto/connector';

export interface HarmonizationTargetDTO {
  name: string;
  dataType: DataTypeDto;
  staticColumn: boolean;
}

export interface HarmonizationDTO extends Partial<BaseDto> {
  name: string;
  referenceFileId?: number;
  referenceKey?: string;
  targets: HarmonizationTargetDTO[];
  sourceFileId?: number;
  sourceKey?: string;
  transformer: ConnectorTransformerDTO[];
  mapping: ConnectorMappingDTO[];
  outputFileId?: number;
}

export interface HarmonizationResultDTO {
  outputFileId: number;
  rows: number;
  rejected: Record<string, number>;
  unmatched: string[];
  preview: Record<string, unknown>[];
}
