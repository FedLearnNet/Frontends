import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges, ViewChild,
  ViewContainerRef
} from '@angular/core';

import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../models/connector-step-config";
import {ConnectorStepDataSourceConfigComponent} from "./data-source/data-source.component";
import {ConnectorStepDataSourceInputFileConfigComponent} from "./input-file/input-file.component";
import {ConnectorStepDataSourceInputFTPConfigComponent} from "./input-ftp/input-ftp.component";
import {ConnectorStepDataSourceInputFunctionConfigComponent} from "./input-function/input-function.component";
import {ConnectorConfig} from "../../../../models/connector-config";
import {ConnectorStepConfigs} from "../../../../enum/connector-step-config";
import {ConnectorSourceCard} from "../../../../models/connector-card";
import {ConnectorStepSpecifySelectorsComponent} from "./specify-selectors/specify-selectors.component";

const componentMapper: { [key: string]: any } = {
  source_config: ConnectorStepDataSourceConfigComponent,
  source_file_config: ConnectorStepDataSourceInputFileConfigComponent,
  source_input_config: ConnectorStepDataSourceInputFTPConfigComponent,
  source_function_config: ConnectorStepDataSourceInputFunctionConfigComponent,
  specify_selectors_config: ConnectorStepSpecifySelectorsComponent
};


@Component({
  selector: 'app-connector-step-config',
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectorStepConfigComponent implements OnInit, OnChanges, ConnectorStepConfig {
  @Input() componentType: string | number;
  @ViewChild('dynamicComponentContainer', {read: ViewContainerRef, static: true}) container: ViewContainerRef;
  @Output() save = new EventEmitter<ConnectorStepConfigChangeEmitter>();
  @Input() config: ConnectorConfig = {};
  @Output() configChange = new EventEmitter<ConnectorConfig>();

  componentRef: ComponentRef<ConnectorStepConfig>;

  constructor() {
  }

  ngOnInit() {
    this.loadComponent(this.config);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['componentType'] && !changes['componentType'].firstChange) {
      this.loadComponent(this.config);
    }
  }

  loadComponent(data: any = null) {
    const componentType = componentMapper[this.componentType];
    if (componentType) {
      this.container.clear();
      this.componentRef = this.container.createComponent(componentType);
      this.componentRef.instance.config = data;
      this.componentRef.instance.save.subscribe(event => this.handleEvent(event));
    }
  }

  handleEvent(event: any) {
    if (this.componentType === ConnectorStepConfigs.STEP_SOURCE_CONFIG) {
      this.config.inputSource = event.data as ConnectorSourceCard;
      this.componentType = this.config.inputSource.configName;
      this.save.emit({data: this.config, step: ConnectorStepConfigs.STEP_SOURCE_CONFIG});
      this.configChange.emit(this.config);
      this.loadComponent();
    }

    console.log('Event received:', event);
  }

  onContinueClick(): boolean {
    return this.componentRef.instance.onContinueClick();
  }

}
