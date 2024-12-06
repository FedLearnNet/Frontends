import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ModelDetailDto, ModelSubDto, ModelVersionDto} from "@global-app/model-store/dto/model";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {RouterLink} from "@angular/router";
import {cloneDeep} from "lodash";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {ModelService} from "@global-app/model-store/services/model.service";

interface ModelDetail {
  model: ModelDetailDto;
  version: ModelVersionDto;
}

@Component({
  selector: 'app-model-version-detail',
  standalone: true,
  imports: [MatDialogModule,
    MatButtonModule,
    CommonModule,
    SharedLibModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTableModule, RouterLink],
  templateUrl: './model-version-detail.component.html',
  styleUrl: './model-version-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelVersionDetailComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<ModelVersionDetailComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly modelService: ModelService = inject(ModelService);
  readonly data = inject<ModelDetail>(MAT_DIALOG_DATA);

  published = this.data.version.publishStatus === 'PUBLISHED';
  displayedColumns: string[] = ['id', 'modelParams', 'imageName', 'status', 'experimentRunId', 'actions'];

  versionFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^\\d+\\.\\d+\\.\\d+$')
  ]);

  version: ModelVersionDto;
  selectedModel: boolean = false;

  ngOnInit(): void {
    this.version = cloneDeep(this.data.version);
    this.versionFormControl.setValue(this.version.modelVersion);
    this.cdr.detectChanges();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.versionFormControl.invalid) {
      return;
    }

    this.version.modelVersion = this.versionFormControl.value!;


    if(this.selectedModel && this.version.selectedSubModel) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Select Model',
          message: 'Are you sure you want to select this model parameter? All other parameters will be deleted.',
          dismissButtonText: 'Cancel',
          confirmButtonText: 'Select',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (!result) return;

        this.modelService.selectSubModel(this.version.selectedSubModel!.id!).subscribe((subModel) => {
          this.version.selectedSubModel = subModel;
          this.version.subModels = [subModel];
          this.dialogRef.close(this.version);
        });
      });
    }else{
      this.dialogRef.close(this.version);
    }
  }


  selectSubModel(subModel: ModelSubDto): void {
    this.selectedModel = true;
    this.version.selectedSubModel = subModel;
    this.cdr.detectChanges();
  }

}
