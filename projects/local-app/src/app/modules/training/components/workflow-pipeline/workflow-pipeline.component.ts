import {Component, computed, input} from '@angular/core';
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {WorkflowAppComponent} from "../workflow-app/workflow-app.component";

@Component({
  selector: 'app-workflow-pipeline',
  imports: [
    WorkflowAppComponent
  ],
  templateUrl: './workflow-pipeline.component.html',
  styleUrl: './workflow-pipeline.component.scss'
})
export class WorkflowPipelineComponent {
  apps = input.required<AppDetailDto[]>();
  project = input.required<ProjectDetailDto>();
  compact = input<boolean>(false);


  readonly sortedApps = computed(() => {
    return [];
    /* return this.apps().sort((a, b) => {
       const orderA = this.project().workflow!.find(workflow => workflow.federatedAppId === a.id)?.orderValue || 0;
       const orderB = this.project().workflow!.find(workflow => workflow.federatedAppId === b.id)?.orderValue || 0;
       return orderA - orderB;
     });*/
  });

}
