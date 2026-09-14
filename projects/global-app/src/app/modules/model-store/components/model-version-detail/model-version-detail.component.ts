import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  signal
} from '@angular/core';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ModelDto, ModelSubDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {ModelService} from "@global-app/model-store/services/model.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {
  ModelVersionSubCardComponent
} from "@global-app/model-store/components/model-version-sub-card/model-version-sub-card.component";
import {
  ModelVersionSubDetailComponent
} from "@global-app/model-store/components/model-version-sub-detail/model-version-sub-detail.component";
import {ModelPublishStatus} from "@global-app/model-store/dto/model-status";
import {PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {MatSelectModule} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {Store} from "@ngrx/store";
import {updateModelVersion} from "@shared-lib/modules/app-execution/store/model/model.actions";

@Component({
  selector: 'app-model-version-detail',
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTableModule,
    TranslatePipe,
    ModelVersionSubCardComponent,
    ModelVersionSubDetailComponent,
    PublishBadgeComponent,
    MatSelectModule,
    MatIcon
  ],
  templateUrl: './model-version-detail.component.html',
  styleUrl: './model-version-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelVersionDetailComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly modelService: ModelService = inject(ModelService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly store: Store = inject(Store);

  modelDetail = input.required<ModelDto>();
  modelVersion = model.required<ModelVersionDto>();


  published = computed(() => this.modelVersion().publishStatus === ModelPublishStatus.PUBLISHED);
  previewedSubModel = signal<ModelSubDto | undefined>(undefined);
  publishStatusOptions = Object.values(ModelPublishStatus);

  editForm!: FormGroup;
  isEditing = signal(false);

  selectedModel: boolean = false;

  ngOnInit(): void {
    this.editForm = this.fb.group({
      modelVersion: ['', [Validators.required, Validators.pattern('^\\d+\\.\\d+\\.\\d+$')]],
      changelog: ['', Validators.required],
      publishStatus: ['', Validators.required]
    });
    this.editForm.reset(this.modelVersion());
    this.editForm.disable();
    if (this.modelVersion() && this.modelVersion().subModels && this.modelVersion().subModels!.length > 0) {
      this.togglePreview(this.modelVersion().subModels![0])
    }
    this.cdr.detectChanges();
  }

  enterEditMode(): void {
    if (this.published()) {
      return;
    }
    this.editForm.enable();
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.editForm.disable();
    this.editForm.reset(this.modelVersion());
    this.isEditing.set(false);
  }


  save(): void {
    if (this.editForm.invalid) {
      return;
    }
    this.modelVersion.update(v => ({
      ...v,
      ...this.editForm.value
    }));

    this.editForm.disable();
    this.isEditing.set(false);

    this.store.dispatch(updateModelVersion({
      id: this.modelVersion().modelId,
      modelVersionId: this.modelVersion().id,
      dto: this.modelVersion()
    }));
  }

  saveSubModel(): void {
    if (this.editForm.invalid) {
      return;
    }
    this.modelVersion.update(v => ({
      ...v,
      ...this.editForm.value
    }));

    this.editForm.disable();
    this.isEditing.set(false);

    if (this.selectedModel && this.modelVersion().selectedSubModel) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: this.translate.instant('DIALOG.SELECT_MODEL.TITLE'),
          message: this.translate.instant('DIALOG.SELECT_MODEL.MESSAGE'),
          dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
          confirmButtonText: this.translate.instant('BUTTON.SELECT'),
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (!result) return;

        this.modelService.selectSubModel(this.modelVersion().selectedSubModel!.id!).subscribe((subModel) => {
          this.modelVersion.update(v => {
            v.selectedSubModel = subModel;
            v.subModels = [subModel];
            return v;
          });
        });
      });
    }
  }


  selectSubModel(subModel: ModelSubDto): void {
    this.selectedModel = true;
    this.modelVersion.update(v => {
      v.selectedSubModel = subModel;
      return v;
    });
    this.cdr.detectChanges();
  }


  togglePreview(subModel: ModelSubDto): void {
    if (this.previewedSubModel()?.id === subModel.id) {
      this.previewedSubModel.set(undefined);
    } else {
      this.previewedSubModel.set(subModel);
    }
  }

}
