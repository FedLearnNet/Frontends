import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatRadioModule} from "@angular/material/radio";
import {ProjectCreateDto} from "@global-app/project/dto/project";
import {MatDivider} from "@angular/material/divider";
import {SelectQueryComponent} from "@global-app/find-data/components/select-query/select-query.component";
import {TranslatePipe} from "@ngx-translate/core";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {ProjectService} from "@global-app/project/services/project-service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


@Component({
  selector: 'app-create-project',
  imports: [MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
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
  private readonly projectService: ProjectService = inject(ProjectService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    acceptProcess: new FormControl<boolean>(false, [Validators.requiredTrue]),
    platformIsCoordinator: new FormControl<boolean>(false, {nonNullable: true})
  });

  queryId?: number;

  readonly platformAggregatorSupported = signal(false);

  ngOnInit() {
    this.cdr.detectChanges();
    this.projectService.getPlatformAggregatorSupported()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: supported => {
          this.platformAggregatorSupported.set(supported);
          this.cdr.detectChanges();
        },
        error: () => this.platformAggregatorSupported.set(false),
      });
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
        queryId: this.queryId,
        platformIsCoordinator: this.platformAggregatorSupported()
          ? (this.newExperimentForm.value.platformIsCoordinator ?? false)
          : false
      }
      this.dialogRef.close(createDto);
    } else {
      this.cdr.detectChanges();
    }
  }
}
