import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  ConnectorSourceCard,
  globalGenericSource,
  globalNativeSource
} from "../../../../../models/connector-card";
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {ConnectorStepConfigs} from "../../../../../enum/connector-step-config";
import {ConnectorConfig} from "../../../../../models/connector-config";

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source.component.html',
  styleUrl: './data-source.component.scss'
})

export class ConnectorStepDataSourceConfigComponent implements OnInit, ConnectorStepConfig {
  @Input() config: ConnectorConfig = {};
  @Output() configChange = new EventEmitter<ConnectorConfig>();
  @Output() save = new EventEmitter<ConnectorStepConfigChangeEmitter>();

  public selected?: ConnectorSourceCard;

  genericSource: ConnectorSourceCard[] = globalGenericSource;
  nativeSource: ConnectorSourceCard[] = globalNativeSource;

  ngOnInit() {
    this.selected = this.config.inputSource;
  }

  toggleSelect(selectedCard: ConnectorSourceCard) {
    this.selected = selectedCard;
    this.config.inputSource = selectedCard;

    this.save.emit({step: ConnectorStepConfigs.STEP_SOURCE_CONFIG, data: this.selected});
    this.configChange.emit(this.config);
  }

  onContinueClick(): boolean {
    return true;
  }
}
