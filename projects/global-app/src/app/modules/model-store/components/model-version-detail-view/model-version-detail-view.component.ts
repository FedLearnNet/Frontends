import {Component, computed, effect, inject, input, OnInit} from '@angular/core';
import {
  ModelVersionDetailComponent
} from "@global-app/model-store/components/model-version-detail/model-version-detail.component";
import {Store} from "@ngrx/store";
import {
  selectModelDetail,
  selectModelError,
  selectModelLoading,
  selectSubModelForExperiment
} from "@shared-lib/modules/app-execution/store/model/model.selectors";
import {
  loadModelDetail,
  loadModelVersionForExperiment
} from "@shared-lib/modules/app-execution/store/model/model.actions";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

@Component({
  selector: 'app-model-version-detail-view',
  imports: [
    ModelVersionDetailComponent,
    PageWrapperComponent,
    EmptyStateComponent
  ],
  templateUrl: './model-version-detail-view.component.html',
  styleUrl: './model-version-detail-view.component.scss'
})
export class ModelVersionDetailViewComponent implements OnInit {
  private readonly store: Store = inject(Store);
  forExperimentId = input<number>();
  forFederatedExperimentId = input<number>();

  filtered = computed(() => !!this.forExperimentId() || !!this.forFederatedExperimentId());

  selectedVersion = this.store.selectSignal(selectSubModelForExperiment);
  selectedModel = this.store.selectSignal(selectModelDetail);
  selectModelError = this.store.selectSignal(selectModelError);
  selectModelLoading = this.store.selectSignal(selectModelLoading);


  _loadModel = effect(() => {
    if (!this.selectedVersion() || !this.selectedVersion()!.modelId) {
      return;
    }
    const modelId = this.selectedVersion()!.modelId!;
    this.store.dispatch(loadModelDetail({
      id: modelId
    }));
  });

  ngOnInit() {
    if (this.filtered()) {
      this.store.dispatch(loadModelVersionForExperiment({
        federatedExperimentId: this.forFederatedExperimentId(),
        experimentId: this.forExperimentId()
      }));
    }
  }
}
