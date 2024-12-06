import {Component, inject, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {AppRunTestStartComponent} from "../app-run-test-start/app-run-test-start.component";
import {AppRunTestDetailComponent} from "../app-run-test-detail/app-run-test-detail.component";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {TestRunService} from "../../../../service/test-run.service";
import {RunStatusTypes, TestRunDTO} from "../../../../dto/test-run";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {ControllerSocketService} from "../../../../service/testembed-socket.service";


@Component({
  selector: 'app-app-run-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './app-run-test.component.html',
  styleUrl: './app-run-test.component.scss'
})
export class AppRunTestComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly runService: TestRunService = inject(TestRunService);
  private readonly runTestEmbedService: ControllerSocketService = inject(ControllerSocketService);

  @Input() app?: AppDetailDto;
  @Input() appRunning: boolean = false;
  @Input() datafiles: string[] = [];

  displayedColumns: string[] = ['position', 'status', 'error', 'startTime', 'appVersion'];
  dataSource: MatTableDataSource<TestRunDTO> = new MatTableDataSource();

  ngOnInit() {
    if (this.app) {
      this.runService.getRuns(this.app.id).subscribe((runs) => {
        this.dataSource.data = runs;
      });

      this.runTestEmbedService.getRunCreated$().subscribe((run) => {
        this.updateOrAddRun(run);
      });
      this.runTestEmbedService.getRunUpdate$().subscribe((run) => {
        this.updateOrAddRun(run);
      });
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
    return dto.error !== null || dto.status.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  }

  isRunSuccess(dto: TestRunDTO): boolean {
    return dto.status.toLowerCase() === RunStatusTypes.FINISHED.toLowerCase()
  }

  addNewTest(): void {
    const dialogRef = this.dialog.open(AppRunTestStartComponent, {
      data: {
        app: this.app,
        datafiles: this.datafiles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result);
      }
    });
  }

  showDetail(run: TestRunDTO, index: number): void {
    const dialogRef = this.dialog.open(AppRunTestDetailComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: {app: this.app, run: run, nr: index + 1},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result);
      }
    });
  }
}
