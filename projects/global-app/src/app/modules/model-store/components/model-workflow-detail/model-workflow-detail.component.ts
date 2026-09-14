import {Component} from '@angular/core';
import {
  ModelWorkflowDetailComponent as LibModelWorkflowDetailComponent
} from "@shared-lib/modules/app-execution/components/model-workflow-detail/model-workflow-detail.component";

@Component({
  selector: 'app-model-workflow-detail',
  imports: [
    LibModelWorkflowDetailComponent,
  ],
  templateUrl: './model-workflow-detail.component.html',
  styleUrl: './model-workflow-detail.component.scss'
})
export class ModelWorkflowDetailComponent {

}
