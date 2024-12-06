import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
    AppRunTestComponent
} from "../../../../../test-app/components/app-runs/components/app-run-test/app-run-test.component";
import {ExperimentComponent} from "../../../../../test-app/components/experiment/experiment.component";
import {MatTab, MatTabGroup, MatTabsModule} from "@angular/material/tabs";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ProjectDto} from "@global-app/project/dto/project";
import {
  ListFederatedExperimentComponent
} from "@global-app/project/components/runs/list-federated-experiment/list-federated-experiment.component";
import {
  ListLocalExperimentComponent
} from "@global-app/project/components/runs/list-local-experiment/list-local-experiment.component";

@Component({
  selector: 'app-project-runs',
  standalone: true,
  imports: [
    MatTabsModule,
    ListFederatedExperimentComponent,
    ListLocalExperimentComponent
  ],
  templateUrl: './project-runs.component.html',
  styleUrl: './project-runs.component.scss'
})
export class ProjectRunsComponent implements OnChanges {
  @Input() project?: ProjectDto;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["project"] && !changes["project"].firstChange) {
      this.project = changes["project"].currentValue;
    }
  }

}
