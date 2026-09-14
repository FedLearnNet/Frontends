import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ProjectFederatedCreateExperimentDTO} from "@global-app/project/dto/project-experiments";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {ProjectFederatedExperimentsActions} from "@global-app/project/store/project-federated-experiments.actions";
import {MatDivider} from "@angular/material/list";
import {hasExportSelections} from "@shared-lib/modules/data-modeler/utils/patient-export-config.util";
import {WorkflowTrainingHelperService} from "@shared-lib/modules/workflow/service/workflow-traning.helper";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

interface FederatedExperimentData {
  project: ProjectDetailDto,
  workflow: WorkflowDTO
}

@Component({
  selector: 'app-create-federated-experiment',
  imports: [MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule,
    TranslatePipe, ErrorCardComponent, MatDivider, CloseableDialogTitleComponent, HintCardComponent, BtnComponent,
  ],
  templateUrl: './create-federated-experiment.component.html',
  styleUrl: './create-federated-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateFederatedExperimentComponent {
  private readonly dialogRef: MatDialogRef<CreateFederatedExperimentComponent> = inject(MatDialogRef);
  private readonly router: Router = inject(Router);
  private readonly store: Store = inject(Store);
  private readonly wths: WorkflowTrainingHelperService = inject(WorkflowTrainingHelperService);

  readonly data = inject<FederatedExperimentData>(MAT_DIALOG_DATA);
  readonly trainableApps = this.wths.containsTrainableApps(this.data.workflow);
  readonly project = this.data.project;

  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    acceptProcess: new FormControl<boolean>(false, [Validators.requiredTrue]),
    modelNeedToBePublic: new FormControl<boolean>(false, [Validators.required]),
  });


  get hasProject(): boolean {
    return !!(this.project && this.project.id);
  }

  get hasProjectName(): boolean {
    return !!(this.hasProject && this.project.name);
  }

  get hasProjectDescription(): boolean {
    return !!(this.hasProject && this.project.description);
  }

  get hasEnoughSelectedData(): boolean {
    return this.hasProject && hasExportSelections(this.project.exportConfig);
  }

  get hasQueryId(): boolean {
    return !!(this.hasProject && this.project.queryId);
  }

  isValidProject(): boolean {
    return this.hasProject && this.hasProjectName &&
      this.hasProjectDescription && this.hasEnoughSelectedData && this.hasQueryId;
  }

  onSubmit(): void {
    if (!this.isValidProject()) {
      return;
    }
    this.onSubmitFederated();
  }

  onSubmitFederated(): void {
    if (this.newExperimentForm.valid) {
      console.log(this.newExperimentForm.value);
      const createDto: ProjectFederatedCreateExperimentDTO = {
        name: this.newExperimentForm.value.name || '',
        description: this.newExperimentForm.value.description || '',
        modelNeedToBePublic: this.newExperimentForm.value.modelNeedToBePublic || false,
      }
      this.store.dispatch(ProjectFederatedExperimentsActions.create({dto: createDto, projectId: this.project.id}));
      this.dialogRef.close();
    }
  }

  routeToPage(hash: string) {
    this.router.navigate([], {
      fragment: hash,
      replaceUrl: true,
      queryParamsHandling: 'preserve',
    });
    this.dialogRef.close();
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
