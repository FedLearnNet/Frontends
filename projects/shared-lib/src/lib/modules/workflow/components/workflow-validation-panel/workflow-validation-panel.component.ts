import {ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  WorkflowValidationError,
  WorkflowValidationService
} from "@shared-lib/modules/workflow/service/workflow-validation.service";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";

export interface WorkflowValidationErrorModel extends WorkflowValidationError {
  key: string;
}

@Component({
  selector: 'lib-workflow-validation-panel',
  imports: [
    BadgeComponent,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './workflow-validation-panel.component.html',
  styleUrl: './workflow-validation-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowValidationPanelComponent {
  private readonly workflowValidationService: WorkflowValidationService = inject(WorkflowValidationService);
  readonly workflow = input.required<WorkflowDTO>();
  readonly isValidChange = output<boolean>();

  readonly showNavigate = input<boolean>(false);
  readonly mapNavigateTarget = input<((err: WorkflowValidationError) => unknown) | null>(null);
  readonly onNavigate = input<((target: unknown) => void) | null>(null);

  readonly expanded = signal(false);
  readonly items = signal<WorkflowValidationErrorModel[]>([]);


  readonly errorCount = computed(() => this.items().length);
  readonly isOk = computed(() => this.errorCount() === 0);

  constructor() {
    effect(() => {
      const w = this.workflow();
      const r = this.workflowValidationService.validate(w);
      if (!r) return;
      if (r.valid) this.expanded.set(false);
      this.isValidChange.emit(r.valid);
      const items = r.errors.map((e, idx) => {
        return {
          key: `${e.code}:${e.path}:${idx}`,
          ...e,
        } as WorkflowValidationErrorModel;
      });
      this.items.set(items);
    });
  }

  toggleExpanded(): void {
    this.expanded.update(v => !v);
  }
}
