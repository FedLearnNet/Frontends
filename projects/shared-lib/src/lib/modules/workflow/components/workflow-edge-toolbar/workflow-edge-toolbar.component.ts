import {Component, model, output} from '@angular/core';
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {WorkflowConnectionDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

@Component({
  selector: 'lib-workflow-edge-toolbar',
  imports: [
    MatIcon,
    MatTooltip
  ],
  templateUrl: './workflow-edge-toolbar.component.html',
  styleUrl: './workflow-edge-toolbar.component.scss'
})
export class WorkflowEdgeToolbarComponent {
  connection = model.required<WorkflowConnectionDTO>();
  removed = output<WorkflowConnectionDTO>();


  public changeConnectionType(): void {

  }

  public removeConnection(): void {
    this.removed.emit(this.connection());
  }
}
