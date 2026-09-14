import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {ProjectCreateDto} from "@global-app/project/dto/project";
import {MatDivider} from "@angular/material/divider";
import {SelectQueryComponent} from "@global-app/find-data/components/select-query/select-query.component";
import {TranslatePipe} from "@ngx-translate/core";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";


@Component({
  selector: 'app-create-project',
  imports: [MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule,
    MatDivider,
    SelectQueryComponent,
    TranslatePipe, TranslatePipe, CloseableDialogTitleComponent, BtnComponent,
  ],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProjectComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<CreateProjectComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    acceptProcess: new FormControl<boolean>(false, [Validators.requiredTrue])
  });

  queryId?: number;

  ngOnInit() {
    this.cdr.detectChanges();
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  onSubmit(): void {
    if (this.newExperimentForm.valid) {
      const createDto: ProjectCreateDto = {
        name: this.newExperimentForm.value.name || '',
        description: this.newExperimentForm.value.description || '',
        queryId: this.queryId
      }
      this.dialogRef.close(createDto);
    } else {
      this.cdr.detectChanges();
    }
  }
}
