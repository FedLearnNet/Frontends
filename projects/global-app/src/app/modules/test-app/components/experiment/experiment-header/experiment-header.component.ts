import {Component, Input, OnInit} from '@angular/core';
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ExperimentDetailDTO, ExperimentRunDTO} from "../../../dto/experiment";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {RunStatusTypes} from "../../../dto/test-run";
import {ModelDetailDto, ModelVersionDto} from "@global-app/model-store/dto/model";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-experiment-header',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, RouterLink],
  templateUrl: './experiment-header.component.html',
  styleUrl: './experiment-header.component.scss'
})
export class ExperimentHeaderComponent implements OnInit {
  @Input() app?: AppDetailDto;
  @Input() experiment?: ExperimentDetailDTO;
  @Input() run?: ExperimentRunDTO;
  @Input() model?: ModelVersionDto;

  totalRuns: number = 0;
  passedRuns: number = 0;
  failedRuns: number = 0;

  ngOnInit(): void {
    if (this.experiment) {
      this.totalRuns = this.experiment.runs.length;
      this.passedRuns = this.experiment.runs.filter(run => run.status.toLowerCase() === RunStatusTypes.FINISHED.toLowerCase()).length;
      this.failedRuns = this.experiment.runs.filter(run => run.status.toLowerCase()  === RunStatusTypes.ERROR.toLowerCase()).length;
    }
  }

  getInputNames(): string[] {
    if(!this.experiment?.inputFilePaths){
      return [];
    }
    return Object.keys(this.experiment?.inputFilePaths)
  }


}
