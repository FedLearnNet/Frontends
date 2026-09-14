import {EventEmitter, InputSignal, ModelSignal, OutputEmitterRef} from "@angular/core";
import {ConnectorDTO} from "../dto/connector";


export interface ConnectorStepConfigChangeEmitter {
  data: any;
  step: string;
}


export interface ConnectorStepConfig<TConfig = ConnectorDTO> {
  config: TConfig | ModelSignal<TConfig> | InputSignal<TConfig>;
  save: EventEmitter<ConnectorStepConfigChangeEmitter> | OutputEmitterRef<ConnectorStepConfigChangeEmitter>;
  configChange?: OutputEmitterRef<TConfig>;

  onContinueClick(): boolean;
}

export function isModelSignal<T>(v: unknown): v is ModelSignal<T> {
  return typeof v === 'function' && typeof (v as any).set === 'function';
}

export function isInputSignal<T>(v: unknown): v is InputSignal<T> {
  return typeof v === 'function' && typeof (v as any).set !== 'function';
}
