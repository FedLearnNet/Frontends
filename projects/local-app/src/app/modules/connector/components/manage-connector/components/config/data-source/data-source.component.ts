import {Component, computed, effect, inject, OnInit, output, signal, ChangeDetectionStrategy, input, linkedSignal} from '@angular/core';
import {ConnectorSourceCard, globalGenericSource, storeItemToCard} from "../../../../../models/connector-card";
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {ConnectorStepConfigs} from "../../../../../enum/connector-step-config";
import {MatDivider} from '@angular/material/divider';

import {MatCard, MatCardAvatar, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Store} from "@ngrx/store";
import {selectStoreList} from "@shared-lib/modules/store/store/store.selectors";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {ConnectorDTO} from "../../../../../dto/connector";
import {isAppBasedUploadSettings} from "../../../../../helper/connector-config-helper";

function withoutTag(image: string): string {
  const tagStart = image.lastIndexOf(':');
  return tagStart > image.lastIndexOf('/') ? image.substring(0, tagStart) : image;
}

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source.component.html',
  styleUrl: './data-source.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDivider,
    MatCard,
    MatCardHeader,
    MatIcon,
    MatCardAvatar,
    MatCardTitle,
    MatCardSubtitle,
    TranslatePipe, StoreCardComponent]
})
export class ConnectorStepDataSourceConfigComponent implements OnInit, ConnectorStepConfig<ConnectorDTO> {
  private readonly store: Store = inject(Store);

  // eslint-disable-next-line @angular-eslint/no-input-rename -- public name belongs to the linkedSignal below
  configInput = input.required<ConnectorDTO>({alias: 'config'});
  config = linkedSignal(this.configInput);

  readonly configChange = output<ConnectorDTO>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();

  public selected = signal<ConnectorSourceCard | undefined>(undefined);
  private readonly storeList = this.store.selectSignal(selectStoreList);

  public storeItems = computed(() => {
    const items = (this.storeList() ?? []).filter(item => item.app && !item.model && !item.workflow);
    const inputConfig = this.config()?.inputConfig;
    if (!inputConfig || !isAppBasedUploadSettings(inputConfig)) {
      return items;
    }
    const used = items.filter(item => this.isApp(item, String(inputConfig.appVersionId), inputConfig.appImage));
    return [...used, ...items.filter(item => !used.includes(item))];
  });

  genericSource: ConnectorSourceCard[] = globalGenericSource.filter(source => source.id === 'file_upload');

  ngOnInit() {
    this.store.dispatch(StoreActions.loadList({
      params: {
        page: 0,
        appTypes: [FederatedAppType.EXTRACTOR],
        hideWorkflow: true
      }
    }));
  }

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (cfg && cfg.inputSource) {
        this.selected.set(cfg.inputSource);
      }
    });
  }

  toggleSelect(selectedCard: ConnectorSourceCard) {
    this.config.update((c) => {
      c!.inputSource = selectedCard;
      return c;
    });

    this.save.emit({step: ConnectorStepConfigs.STEP_SOURCE_CONFIG, data: selectedCard});
    this.configChange.emit(this.config()!);
  }

  toggleAppSelect(item: StoreDTO) {
    this.toggleSelect(storeItemToCard(item)!);
  }

  getStoreItemId(item: StoreDTO) {
    return "" + item.app!.latestVersionId;
  }

  isSelectedApp(item: StoreDTO): boolean {
    const selected = this.selected();
    if (selected?.configName !== ConnectorStepConfigs.STEP_SOURCE_APP_BASED) {
      return false;
    }
    const inputConfig = this.config()?.inputConfig;
    const appImage = inputConfig && isAppBasedUploadSettings(inputConfig) && String(inputConfig.appVersionId) === selected.id
      ? inputConfig.appImage
      : undefined;
    return this.isApp(item, selected.id, appImage);
  }

  private isApp(item: StoreDTO, versionId: string, appImage?: string): boolean {
    if (!item.app) {
      return false;
    }
    if (this.getStoreItemId(item) === versionId) {
      return true;
    }
    return !!appImage && !!item.app.imageName && withoutTag(appImage) === withoutTag(item.app.imageName);
  }

  onContinueClick(): boolean {
    return true;
  }
}
