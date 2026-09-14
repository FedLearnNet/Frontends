import {Component, inject, input} from '@angular/core';
import {Store} from "@ngrx/store";
import {
  selectSelectedApp,
  selectSelectedModel,
  selectStoreLoading
} from "@shared-lib/modules/store/store/store.selectors";
import {UiActionDto, UiActionKind} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {MatCard} from "@angular/material/card";

@Component({
  selector: 'lib-data-analysis-chat-hover-card',
  imports: [
    SkeletonLoaderComponent,
    StoreCardComponent,
    MatCard
  ],
  templateUrl: './data-analysis-chat-hover-card.component.html',
  styleUrl: './data-analysis-chat-hover-card.component.scss',
})
export class DataAnalysisChatHoverCardComponent {
  private readonly store: Store = inject(Store);
  action = input.required<UiActionDto>();

  selectedModel = this.store.selectSignal(selectSelectedModel);
  selectedApp = this.store.selectSignal(selectSelectedApp);
  storeLoading = this.store.selectSignal(selectStoreLoading);
  protected readonly UiActionKind = UiActionKind;
}
