import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {ListProjectRunsComponent} from "@global-app/project/components/runs/list-project-runs/list-project-runs.component";
import {TranslatePipe} from "@ngx-translate/core";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  LocalTestExperimentComponent
} from "@global-app/project/components/runs/local-test-experiment/local-test-experiment.component";


@Component({
  selector: 'app-project-runs',
  imports: [
    MatTabsModule,
    ListProjectRunsComponent,
    TranslatePipe,
    LocalTestExperimentComponent,
  ],
  templateUrl: './project-runs.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-runs.component.scss'
})
export class ProjectRunsComponent {
  project = input.required<ProjectDetailDto>();
  workflow = input.required<WorkflowDTO>();
}
