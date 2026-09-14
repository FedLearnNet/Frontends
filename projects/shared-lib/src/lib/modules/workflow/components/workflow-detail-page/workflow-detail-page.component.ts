import {Component, inject, signal} from '@angular/core';
import {WorkflowViewComponent} from "@shared-lib/modules/workflow/components/workflow-view/workflow-view.component";
import {toSignal} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";
import {map} from "rxjs";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {Store} from "@ngrx/store";
import * as WorkflowActions from "@shared-lib/modules/workflow/store/workflow.actions";
import {selectWorkflowError, selectWorkflowLoading} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'lib-workflow-detail-page',
  imports: [
    WorkflowViewComponent,
    ErrorCardComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './workflow-detail-page.component.html',
  styleUrl: './workflow-detail-page.component.scss',
})
export class WorkflowDetailPageComponent {
  private readonly store: Store = inject(Store);

  loading = this.store.selectSignal(selectWorkflowLoading);
  error = this.store.selectSignal(selectWorkflowError);
  isCreating = signal<boolean>(false);
  readonly workflowId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(p => {
        const id = p.get('workflow-id');
        if (id === 'new') {
          this.isCreating.set(true);
          this.store.dispatch(WorkflowActions.createNextEmptyWorkflow());
          return undefined;
        }
        return Number(id);
      })
    ),
    {initialValue: null}
  );
}
