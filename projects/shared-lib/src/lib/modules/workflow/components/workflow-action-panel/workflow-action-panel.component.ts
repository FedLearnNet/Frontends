import {Component, computed, input, output} from '@angular/core';
import {FlowActionPanelAction} from "@shared-lib/modules/workflow/models/workflow-actions.model";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";

@Component({
  selector: 'lib-workflow-action-panel',
  imports: [
    MatTooltip,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './workflow-action-panel.component.html',
  styleUrl: './workflow-action-panel.component.scss'
})
export class WorkflowActionPanelComponent {
  public readonly selectionLength = input<number>(0);
  public readonly isValid = input<boolean>(true);
  public readonly processAction = output<FlowActionPanelAction>();

  protected readonly action = FlowActionPanelAction;

  canRemove = computed(() => this.selectionLength() > 0);
  canConnect = computed(() => this.selectionLength() == 2);
}
