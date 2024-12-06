import {Component, Input} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CommonModule} from "@angular/common";
import {AppRunTestComponent} from "./components/app-run-test/app-run-test.component";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ExperimentComponent} from "../experiment/experiment.component";

@Component({
  selector: 'app-app-runs',
  standalone: true,
  imports: [
    CommonModule,
    MatTab,
    MatTabGroup,
    AppRunTestComponent,
    ExperimentComponent
  ],
  templateUrl: './app-runs.component.html',
  styleUrl: './app-runs.component.scss'
})
export class AppRunsComponent {
  @Input() app?: AppDetailDto;
  @Input() appRunning: boolean = false;
  @Input() datafiles: string[] = [];

}

