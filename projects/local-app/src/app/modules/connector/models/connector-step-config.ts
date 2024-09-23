import {EventEmitter} from "@angular/core";
import {ConnectorConfig} from "./connector-config";


export interface ConnectorStepConfigChangeEmitter {
  data: any;
  step: string;
}


export interface ConnectorStepConfig {
  config: ConnectorConfig;
  save: EventEmitter<ConnectorStepConfigChangeEmitter>;

  onContinueClick(): boolean;
}


