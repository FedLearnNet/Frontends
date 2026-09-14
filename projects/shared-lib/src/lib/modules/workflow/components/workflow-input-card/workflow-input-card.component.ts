import {ChangeDetectionStrategy, Component, input, model, output, signal} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {FFlowModule} from "@foblex/flow";
import {WorkflowInputDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  AppDetailConfigElementComponent
} from "../../../../../../../global-app/src/app/modules/tool-development/components/app-detail-config/components/app-detail-config-element/app-detail-config-element.component";
import {MatIcon} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

@Component({
  selector: 'lib-workflow-input-card',
  imports: [
    MatCardModule,
    FFlowModule,
    AppDetailConfigElementComponent,
    MatIcon,
    BadgeComponent,
  ],
  templateUrl: './workflow-input-card.component.html',
  styleUrl: './workflow-input-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowInputCardComponent {
  node = model.required<WorkflowInputDTO>();
  index = model.required<number>();
  isDeleteDisabled = input<boolean>(false);

  editMode = signal<boolean>(false);
  extended = signal<boolean>(false);

  deleteNode = output<void>();

  toggleEditMode(): void {
    this.editMode.update(e => !e);
    this.node.update(e => {
      return {
        ...e,
        editMode: true
      }
    });
  }


  update(): void {
    this.editMode.update(e => !e);
  }

  toggleExtendedMode(): void {
    this.extended.update(e => !e);
  }

  onDelete(): void {
    this.deleteNode.emit();
  }
}
