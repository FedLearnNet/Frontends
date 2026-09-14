import {Component, input} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {
  ListFederatedExperimentComponent
} from "@global-app/project/components/runs/list-federated-experiment/list-federated-experiment.component";
import {
  ListLocalExperimentComponent
} from "@global-app/project/components/runs/list-local-experiment/list-local-experiment.component";
import {TranslatePipe} from "@ngx-translate/core";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  LocalTestExperimentComponent
} from "@global-app/project/components/runs/local-test-experiment/local-test-experiment.component";


@Component({
  selector: 'app-project-runs',
  imports: [
    MatTabsModule,
    ListFederatedExperimentComponent,
    ListLocalExperimentComponent,
    TranslatePipe,
    LocalTestExperimentComponent,
  ],
  templateUrl: './project-runs.component.html',
  styleUrl: './project-runs.component.scss'
})
export class ProjectRunsComponent {
  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();
}
