import {ConnectorRunStepDTO} from "./log";
import {ConnectorConfigDTO} from "./preview";

export interface AppTransformerPreviewRequestDTO {
  config: ConnectorConfigDTO;
  stepIndex: number;
}

export interface AppTransformerPreviewStreamDTO extends ConnectorRunStepDTO {
  stepIndex?: number;
  rowCount?: number;
  finished?: boolean;
}
