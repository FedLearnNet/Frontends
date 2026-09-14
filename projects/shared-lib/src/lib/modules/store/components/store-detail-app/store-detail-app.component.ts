import {ChangeDetectionStrategy, Component, computed, effect, inject, model, OnInit, signal} from '@angular/core';
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {MatTabsModule} from "@angular/material/tabs";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {TranslatePipe} from "@ngx-translate/core";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {StoreReviewsComponent} from "@shared-lib/modules/store/components/store-reviews/store-reviews.component";
import {selectSelectedApp, selectStoreError, selectStoreLoading} from "@shared-lib/modules/store/store/store.selectors";
import {Store} from "@ngrx/store";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  StoreAppConfigComponent
} from "@shared-lib/modules/store/components/store-app-config/store-app-config.component";
import {
  StoreVersionListComponent
} from "@shared-lib/modules/store/components/store-version-list/store-version-list.component";
import {WorkflowListComponent} from "@shared-lib/modules/workflow/components/workflow-list/workflow-list.component";
import {loadFiles} from "@shared-lib/modules/files/store/file.actions";
import {
  PipelinePublishInfoDetailComponent
} from "../../../../../../../global-app/src/app/modules/pipeline/components/pipeline-publish-info-detail/pipeline-publish-info-detail.component";
import {
  AuditCardComponent
} from "../../../../../../../global-app/src/app/modules/audit/components/audit-card/audit-card.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'lib-store-detail-app',
  imports: [
    MarkdownComponent,
    MatTabsModule,
    TranslatePipe,
    StoreReviewsComponent,
    ErrorCardComponent,
    HeaderComponent,
    StoreAppConfigComponent,
    StoreVersionListComponent,
    WorkflowListComponent,
    PipelinePublishInfoDetailComponent,
    AuditCardComponent,
    HintCardComponent,
    StoreCardComponent,
    PageWrapperComponent
  ],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './store-detail-app.component.html',
  styleUrl: './store-detail-app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreDetailAppComponent implements OnInit {

  private readonly store: Store = inject(Store);

  appDetail = model<AppDetailDto>();
  isLoading = this.store.selectSignal(selectStoreLoading);
  error = this.store.selectSignal(selectStoreError);
  selectedIndex = signal<number>(0);
  private readonly appDetailStore = this.store.selectSignal(selectSelectedApp);

  storeElement = computed(() => {
    return {
      app: this.appDetail(),
      model: undefined
    }
  });


  ngOnInit(): void {
    this.store.dispatch(loadFiles());
  }

  appStoreEffect$ = effect(() => {
    const storeAppDetail = this.appDetailStore();
    if (storeAppDetail) {
      this.appDetail.set(storeAppDetail);

    }
  });

  getAudits(detail: AppDetailDto) {
    if (detail.audits) {
      return detail.audits;
    }
    if (detail.latestVersionId) {
      return detail.versions.find(v => v.id === detail.latestVersionId)?.audits ?? [];
    }
    return [];
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
  }

}
