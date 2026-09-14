import {Component, computed, effect, inject, model, OnInit} from '@angular/core';
import {Location} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {
  ModelDetailAccessComponent
} from "@global-app/model-store/components/model-detail-access/model-detail-access.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDialog} from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {ModelDetailDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {versionChanged} from "@shared-lib/modules/app-execution/store/model/model.actions";
import {selectSelectedModel, selectStoreLoading} from "@shared-lib/modules/store/store/store.selectors";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {
  StoreVersionListComponent
} from "@shared-lib/modules/store/components/store-version-list/store-version-list.component";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {loadFiles} from "@shared-lib/modules/files/store/file.actions";

@Component({
  selector: 'lib-store-detail-model',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    ModelDetailAccessComponent,
    TranslatePipe,
    ErrorCardComponent,
    StoreCardComponent,
    StoreVersionListComponent,
  ],
  templateUrl: './store-detail-model.component.html',
  styleUrl: './store-detail-model.component.scss'
})
export class StoreDetailModelComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store = inject(Store);
  private readonly location: Location = inject(Location);

  modelDetail = model<ModelDetailDto>();
  isLoading = this.store.selectSignal(selectStoreLoading);

  modelDetailStore = this.store.selectSignal(selectSelectedModel);

  storeElement = computed(() => {
    return {
      app: this.modelDetail()?.federatedApp,
      model: this.modelDetail()
    }
  });

  modelStoreEffect$ = effect(() => {
    const storeAppDetail = this.modelDetailStore();
    if (storeAppDetail) {
      this.modelDetail.set(storeAppDetail);
    }
  });


  ngOnInit(): void {
    this.store.dispatch(loadFiles());
  }

  onGoBack(): void {
    this.location.back();
  }

  versionChanged(version: ModelVersionDto | AppVersionDto): void {
    this.store.dispatch(versionChanged({version: version as ModelVersionDto}));
  }

}
