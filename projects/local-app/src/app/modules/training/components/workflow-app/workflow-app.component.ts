import {Component, input} from '@angular/core';
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ProjectDetailDto} from "@global-app/project/dto/project";

@Component({
  selector: 'app-workflow-app',
  imports: [],
  templateUrl: './workflow-app.component.html',
  styleUrl: './workflow-app.component.scss'
})
export class WorkflowAppComponent {
  app = input.required<AppDetailDto>();
  project = input.required<ProjectDetailDto>();

}
