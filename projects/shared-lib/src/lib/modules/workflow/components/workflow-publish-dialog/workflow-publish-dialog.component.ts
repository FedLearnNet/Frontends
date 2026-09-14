import {Component, computed, effect, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {Store} from "@ngrx/store";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {updateWorkflow} from "@shared-lib/modules/workflow/store/workflow.actions";
import {selectSelectedWorkflow, selectWorkflowLoading} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {
  WorkflowOverviewCardComponent
} from "@shared-lib/modules/workflow/components/workflow-overview-card/workflow-overview-card.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'lib-workflow-publish-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    WorkflowOverviewCardComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './workflow-publish-dialog.component.html',
  styleUrl: './workflow-publish-dialog.component.scss',
})
export class WorkflowPublishDialogComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly store: Store = inject(Store);
  readonly dialogRef = inject(MatDialogRef<WorkflowPublishDialogComponent>);
  readonly data = inject<WorkflowDTO>(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });

  loading = this.store.selectSignal(selectWorkflowLoading);
  workflow = this.store.selectSignal(selectSelectedWorkflow);
  private initialFormFilled = false;

  isPublished = computed(() => {
    return this.workflow()?.publishStatus === PublishStatus.PUBLISHED;
  });

  constructor() {
    effect(() => {
      const wf = this.workflow();
      if (wf && !this.initialFormFilled) {
        this.form.patchValue({
          name: wf.name ?? '',
          description: wf.description ?? ''
        });
        this.initialFormFilled = true;
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.isPublished()) {
      this.publish();
    } else {
      this.unpublish();
    }
  }

  publish() {
    const wf = this.workflow();
    if (!wf) {
      return;
    }
    const updated = {
      ...wf,
      ...this.form.value,
      publishStatus: PublishStatus.PUBLISHED
    };
    this.store.dispatch(updateWorkflow({id: wf.id, updateDTO: updated}));
  }

  unpublish() {
    const wf = this.workflow();
    if (!wf) {
      return;
    }
    const updated = {
      ...wf,
      publishStatus: PublishStatus.UNPUBLISHED
    };

    this.store.dispatch(updateWorkflow({id: wf.id, updateDTO: updated}));
  }
}
