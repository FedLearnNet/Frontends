import {ExecutionRunDetailDTO} from "@shared-lib/modules/app-execution/dto/execution-run";
import {ConnectorConfigDTO} from "./preview";

export interface AppTransformerPreviewRequestDTO {
  config: ConnectorConfigDTO;
  stepIndex: number;
}

export interface AppTransformerPreviewStreamDTO extends ExecutionRunDetailDTO {
  stepIndex?: number;
  rowCount?: number;
  finished?: boolean;
}
