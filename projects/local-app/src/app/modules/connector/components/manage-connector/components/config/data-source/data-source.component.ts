import {Component, effect, inject, model, OnInit, output, signal} from '@angular/core';
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

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source.component.html',
  styleUrl: './data-source.component.scss',
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

  config = model.required<ConnectorDTO>();

  readonly configChange = output<ConnectorDTO>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();

  public selected = signal<ConnectorSourceCard | undefined>(undefined);
  public storeItems = this.store.selectSignal(selectStoreList);

  genericSource: ConnectorSourceCard[] = globalGenericSource;

  ngOnInit() {
    this.store.dispatch(StoreActions.loadList({params: {page: 0, appTypes: [FederatedAppType.EXTRACTOR], hideWorkflow: true}}));
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

  onContinueClick(): boolean {
    return true;
  }
}
