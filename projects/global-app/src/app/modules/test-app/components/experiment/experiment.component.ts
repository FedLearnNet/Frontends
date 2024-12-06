import {Component, inject, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {MatButtonModule} from "@angular/material/button";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {RouterLink, RouterModule} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ExperimentService} from "../../service/experiment-run.service";
import {ControllerSocketService} from "../../service/testembed-socket.service";
import {ExperimentDTO} from "../../dto/experiment";
import {RunStatusTypes} from "../../dto/test-run";
import {AppRunTestStartComponent} from "../app-runs/components/app-run-test-start/app-run-test-start.component";
import {ExperimentCreateDialogComponent} from "./experiment-create-dialog/experiment-create-dialog.component";


@Component({
  selector: 'app-experiment',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule],
  templateUrl: './experiment.component.html',
  styleUrl: './experiment.component.scss'
})
export class ExperimentComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly experimentService: ExperimentService = inject(ExperimentService);
  private readonly runTestEmbedService: ControllerSocketService = inject(ControllerSocketService);

  @Input() app?: AppDetailDto;
  @Input() appRunning: boolean = false;
  @Input() datafiles: string[] = [];

  displayedColumns: string[] = ['position', 'status', 'name', 'startTime', 'lastUpdate', 'appVersion'];
  dataSource: MatTableDataSource<ExperimentDTO> = new MatTableDataSource();

  ngOnInit() {
    if (this.app) {
      this.experimentService.getExperiments(this.app.id).subscribe((runs) => {
        this.dataSource.data = runs;
      });
    }
  }

  updateOrAddRun(run: ExperimentDTO): void {
    const data: ExperimentDTO[] = this.dataSource.data;
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

  isRunError(dto: ExperimentDTO): boolean {
    return dto.status && dto.status.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  }

  isRunSuccess(dto: ExperimentDTO): boolean {
    return dto.status && dto.status.toLowerCase() === RunStatusTypes.FINISHED.toLowerCase()
  }

  addNewExperiment(): void {
    const dialogRef = this.dialog.open(ExperimentCreateDialogComponent, {
      data: {
        app: this.app,
        datafiles: this.datafiles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.updateOrAddRun(result);
      }
    });
  }

}
