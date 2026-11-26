import {Component, inject, OnInit, input, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from "@angular/common";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {RouterModule} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ExperimentService} from "../../service/experiment-run.service";
import {ControllerSocketService} from "../../service/testembed-socket.service";
import {RunStatusTypes, TestRunDTO} from "../../dto/test-run";
import {ExperimentCreateDialogComponent} from "./experiment-create-dialog/experiment-create-dialog.component";
import {TranslatePipe} from "@ngx-translate/core";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";


import {AppRunEngineBadgeComponent} from "../app-runs/components/app-run-engine-badge/app-run-engine-badge.component";
@Component({
  selector: 'app-experiment',
  imports: [CommonModule,
    AppRunEngineBadgeComponent,
    MatTableModule,
    MatProgressSpinnerModule,
    RouterModule, TranslatePipe, StatusBadgeComponent, BtnComponent,
  ],
  templateUrl: './experiment.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experiment.component.scss'
})
export class ExperimentComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly experimentService: ExperimentService = inject(ExperimentService);
  private readonly runTestEmbedService: ControllerSocketService = inject(ControllerSocketService);

  readonly app = input<AppDetailDto>();
  readonly appRunning = input<boolean>(false);
  readonly datafiles = input<string[]>([]);

  displayedColumns: string[] = ['position', 'status', 'engine', 'name', 'startTime', 'lastUpdate', 'appVersion'];
  dataSource: MatTableDataSource<TestRunDTO> = new MatTableDataSource();

  ngOnInit() {
    const app = this.app();
    if (app) {
      this.experimentService.getExperiments(app.id).subscribe((runs) => {
        this.dataSource.data = runs;
      });
      this.runTestEmbedService.getExperimentUpdate$().subscribe((run) => this.updateOrAddRun(run));
    }
  }

  updateOrAddRun(run: TestRunDTO): void {
    const data: TestRunDTO[] = this.dataSource.data;
    if (data.find((r) => r.id === run.id) === undefined) {
      this.dataSource.data = [run, ...data];
    } else {
      this.dataSource.data = data.map((r) => {
        if (r.id === run.id) {
          r = run;
        }
        return r;
      });
    }
  }

  isRunError(dto: TestRunDTO): boolean {
    return dto.status && dto.status.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  }

  isRunSuccess(dto: TestRunDTO): boolean {
    return dto.status && dto.status.toLowerCase() === RunStatusTypes.FINISHED.toLowerCase()
  }

  addNewExperiment(): void {
    const dialogRef = this.dialog.open(ExperimentCreateDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {
        app: this.app(),
        datafiles: this.datafiles()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.updateOrAddRun(result);
      }
    });
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
