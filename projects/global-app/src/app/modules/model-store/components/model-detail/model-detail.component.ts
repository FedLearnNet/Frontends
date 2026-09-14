import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ModelDto} from "@shared-lib/modules/app-execution/dto/model";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {
  ModelDetailAccessComponent
} from "@global-app/model-store/components/model-detail-access/model-detail-access.component";
import {ModelHeaderComponent} from "@global-app/model-store/components/model-header/model-header.component";
import {TranslatePipe} from "@ngx-translate/core";
import {Store} from "@ngrx/store";
import {
  selectModelDetail,
  selectModelError,
  selectModelLoading
} from "@shared-lib/modules/app-execution/store/model/model.selectors";
import {updateModel, versionChanged} from "@shared-lib/modules/app-execution/store/model/model.actions";
import {
  StoreVersionListComponent
} from "@shared-lib/modules/store/components/store-version-list/store-version-list.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {ModelPublishStatus} from "@global-app/model-store/dto/model-status";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-model-detail',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    ModelDetailAccessComponent,
    ModelHeaderComponent,
    TranslatePipe,
    StoreVersionListComponent,
    HeaderComponent,
    PageWrapperComponent,
    MatTooltip,
  ],
  templateUrl: './model-detail.component.html',
  styleUrl: './model-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelDetailComponent {
  private readonly store: Store = inject(Store);

  model = this.store.selectSignal(selectModelDetail);
  loading = this.store.selectSignal(selectModelLoading);
  error = this.store.selectSignal(selectModelError);

  selectedIndex = signal<number>(0);
  isEditing = signal<boolean>(false);

  draftName = signal<string>('');
  draftShortDescription = signal<string>('');
  draftLongDescription = signal<string>('');
  draftPublishStatus = signal<ModelPublishStatus>(ModelPublishStatus.PRIVATE);

  readonly publishStatuses = Object.values(ModelPublishStatus);

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
  }

  startEdit(): void {
    const m = this.model();
    if (!m) return;
    this.draftName.set(m.name ?? '');
    this.draftShortDescription.set(m.shortDescription ?? '');
    this.draftLongDescription.set(m.longDescription ?? '');
    this.draftPublishStatus.set(m.publishStatus);
    this.isEditing.set(true);
    this.setSelectedIndex(0);
  }

  saveEdit(): void {
    const m = this.model();
    if (!m) return;
    this.store.dispatch(updateModel({
      id: m.id,
      dto: {
        ...m,
        name: this.draftName(),
        shortDescription: this.draftShortDescription(),
        longDescription: this.draftLongDescription(),
        publishStatus: this.draftPublishStatus(),
      } as ModelDto,
    }));
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  versionChanged(version: any): void {
    this.store.dispatch(versionChanged({version: version}));
  }
}
