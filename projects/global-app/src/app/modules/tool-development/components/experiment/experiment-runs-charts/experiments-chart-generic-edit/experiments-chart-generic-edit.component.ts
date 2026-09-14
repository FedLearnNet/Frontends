import {Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ExperimentDiagramConfigDTO} from "../../../../dto/config";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {getHyperParams, groupRunsByMetric} from "../experiment-runs-charts-helper";
import {MatSelectModule} from "@angular/material/select";
import {cloneDeep} from "lodash";
import {ExperimentRunDTO} from "@shared-lib/modules/app-execution/dto/experiment";


export interface ExperimentDiagramConfig {
  config?: ExperimentDiagramConfigDTO;
  experimentRuns: ExperimentRunDTO[];
}

interface DiagramDetailConfig {
  value: string;
  viewValue: string;
}

interface DiagramConfigGroup {
  disabled?: boolean;
  name: string;
  children: DiagramDetailConfig[];
}

@Component({
  selector: 'app-experiments-chart-generic-edit',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './experiments-chart-generic-edit.component.html',
  styleUrl: './experiments-chart-generic-edit.component.scss'
})
export class ExperimentsChartGenericEditComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ExperimentsChartGenericEditComponent>);
  readonly data = inject<ExperimentDiagramConfig>(MAT_DIALOG_DATA);

  config: ExperimentDiagramConfigDTO;
  editMode: boolean = false;

  experimentRuns: ExperimentRunDTO[] = [];
  metricGroupedRuns = new Map<string, ExperimentRunDTO[]>();
  hyperParamKeys: string[] = [];
  dataAggregatorTypes: string[] = ['max', 'min', 'avg', 'all'];


  diagramYOptions: DiagramConfigGroup[] = [
    {
      name: "Run", children: [{
        value: 'run',
        viewValue: 'Run'
      }], disabled: false
    },
  ]
  diagramXOptions: DiagramConfigGroup[] = []


  ngOnInit(): void {
    if (this.data.config) {
      this.config = this.data.config;
      this.editMode = true;
    } else {
      this.config = {} as ExperimentDiagramConfigDTO;
    }
    this.experimentRuns = this.data.experimentRuns;
    this.metricGroupedRuns = groupRunsByMetric(this.experimentRuns);
    if (this.experimentRuns.length > 0) {
      this.hyperParamKeys = getHyperParams(this.experimentRuns[0]);
      const selectOptions = this.hyperParamKeys.map(key => {
        return {value: key, viewValue: key};
      });
      this.diagramYOptions.push({name: 'HyperParameter', children: selectOptions, disabled: false});
    } else {
      this.diagramYOptions.push({name: 'HyperParameter', children: [], disabled: true});
    }
    const metricOptions = Array.from(this.metricGroupedRuns.keys()).map(metric => {
      return {value: metric, viewValue: metric};
    });
    this.diagramYOptions.push({name: 'Metric', children: metricOptions, disabled: false});

    this.yChange()
  }


  yChange(): void {
    this.diagramXOptions = cloneDeep(this.diagramYOptions);

    this.diagramXOptions.forEach(group => {
      group.children.forEach(option => {
        if (option.value === this.config.yAxisHeader) {
          group.disabled = true;
        }
      });
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.config);
  }

}
