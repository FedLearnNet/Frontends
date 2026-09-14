import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  inject,
  input,
  OnChanges,
  OnInit,
  model,
  output,
  signal,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {
  ConnectorStepConfig,
  ConnectorStepConfigChangeEmitter,
} from "../../../../models/connector-step-config";
import {ConnectorStepDataSourceConfigComponent} from "./data-source/data-source.component";
import {ConnectorStepDataSourceInputFileConfigComponent} from "./input-file/input-file.component";
import {ConnectorStepDataSourceInputFTPConfigComponent} from "./input-ftp/input-ftp.component";
import {ConnectorStepDataSourceInputFunctionConfigComponent} from "./input-function/input-function.component";
import {ConnectorStepConfigs} from "../../../../enum/connector-step-config";
import {ConnectorSourceCard} from "../../../../models/connector-card";
import {ConnectorStepSpecifySelectorsComponent} from "./specify-selectors/specify-selectors.component";
import {ActivatedRoute, Router} from '@angular/router';
import {InputAppBasedComponent} from "./input-app-based/input-app-based.component";
import {ConnectorDTO, ConnectorInputConfigDTO} from "../../../../dto/connector";
import {isFileUploadSettings} from "../../../../helper/connector-config-helper";
import { ConnectorService } from '../../../../services/connector-crud.service';
import { ConnectorInputConfig, FileUploadSettings } from '../../../../models/input-config';

const componentMapper: { [key: string]: any } = {
  source_config: ConnectorStepDataSourceConfigComponent,
  source_file_config: ConnectorStepDataSourceInputFileConfigComponent,
  source_input_config: ConnectorStepDataSourceInputFTPConfigComponent,
  source_function_config: ConnectorStepDataSourceInputFunctionConfigComponent,
  specify_selectors_config: ConnectorStepSpecifySelectorsComponent,
  app_based: InputAppBasedComponent
};


@Component({
  selector: 'app-connector-step-config',
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectorStepConfigComponent implements OnInit, OnChanges, ConnectorStepConfig<ConnectorDTO> {
  readonly config = model<ConnectorDTO>({} as ConnectorDTO);
  readonly componentType = input<string | number>();
  readonly cohortId = input<number | undefined>(undefined);
  private readonly activeComponentType = signal<string | number | undefined>(undefined);

  readonly configChange = output<ConnectorDTO>();
  readonly inputFileChanged = output<void>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();

  @ViewChild('dynamicComponentContainer', {read: ViewContainerRef, static: true}) container: ViewContainerRef;

  componentRef: ComponentRef<ConnectorStepConfig<ConnectorDTO>>;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly connectorService = inject(ConnectorService);

  ngOnInit() {
    this.activeComponentType.set(this.componentType());
    this.loadComponent(this.config());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['componentType'] && !changes['componentType'].firstChange) {
      this.activeComponentType.set(this.componentType());
      this.loadComponent(this.config());
    }
    if (changes['config'] && !changes['config'].firstChange && this.componentRef) {
      this.componentRef.setInput('config', this.config());
    }

    if (changes['cohortId'] && !changes['cohortId'].firstChange && this.usesCohortInput()) {
      this.componentRef?.setInput('cohortId', this.cohortId());
    }
  }

  loadComponent(data: any = null) {
    const activeComponentType = this.activeComponentType();
    if (activeComponentType == null) {
      return;
    }

    const componentType = componentMapper[activeComponentType];
    if (componentType) {
      this.container.clear();
      this.componentRef = this.container.createComponent(componentType);
      this.componentRef.setInput('config', data);
      if (this.usesCohortInput()) {
        this.componentRef.setInput('cohortId', this.cohortId());
      }
      this.componentRef.instance.save.subscribe(event => this.handleEvent(event));
      this.componentRef.instance.configChange?.subscribe(event => this.handleConfigChange(event));

    }
  }

  private usesCohortInput(): boolean {
    return this.activeComponentType() === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG
      || this.activeComponentType() === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG;
  }

  handleEvent(event: any) {
    if (this.activeComponentType() === ConnectorStepConfigs.STEP_SOURCE_CONFIG) {
      const nextConfig = {
        ...this.config(),
        inputSource: event.data as ConnectorSourceCard,
      };
      this.config.set(nextConfig);
      this.activeComponentType.set(nextConfig.inputSource.configName);
      this.save.emit({data: nextConfig, step: ConnectorStepConfigs.STEP_SOURCE_CONFIG});
      this.configChange.emit(nextConfig);
      this.loadComponent(this.config());
    }
  }

  handleConfigChange(event: ConnectorDTO): void {
    const prevConfig = this.config().inputConfig as ConnectorInputConfig;
    const nextConfig = event.inputConfig as ConnectorInputConfig;

    const prevFileId = isFileUploadSettings(prevConfig) ? (prevConfig.fileId ?? null) : null;
    const nextFileId = isFileUploadSettings(nextConfig) ? (nextConfig.fileId ?? null) : null;

    this.config.set(event);
    this.configChange.emit(this.config());

    if (prevFileId !== nextFileId && nextFileId != null) {
      this.inputFileChanged.emit();
    }

    if (this.shouldSaveConnector(prevConfig, nextConfig, prevFileId, nextFileId)) {
      this.connectorService.save(this.config()).subscribe();
    }

    if (this.fileExists(prevConfig) || !this.fileExists(nextConfig)) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { uploaded: true },
      });
    }
  }

  private fileExists(input: ConnectorInputConfig): boolean {
    return isFileUploadSettings(input as ConnectorInputConfigDTO) && (input as FileUploadSettings).fileExists === true;
  }

  onContinueClick(): boolean {
    return this.componentRef.instance.onContinueClick();
  }

  private shouldSaveConnector(
      prevConfig: ConnectorInputConfig,
      nextConfig: ConnectorInputConfig,
      prevFileId: number | null,
      nextFileId: number | null
  ): boolean {
    if (!this.config().id) return false;

    const fileIdChanged = prevFileId !== nextFileId;
    const fileNewlyExists = !this.fileExists(prevConfig) && this.fileExists(nextConfig);

    return fileIdChanged || fileNewlyExists;
  }
}
