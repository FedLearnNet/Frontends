import {Component, inject, OnInit, input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {AppRunTestStartComponent} from "../app-run-test-start/app-run-test-start.component";
import {AppRunTestDetailComponent} from "../app-run-test-detail/app-run-test-detail.component";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {TestRunService} from "../../../../service/test-run.service";
import {TestRunDTO} from "../../../../dto/test-run";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {ControllerSocketService} from "../../../../service/testembed-socket.service";
import {TranslatePipe} from "@ngx-translate/core";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";


@Component({
  selector: 'app-app-run-test',
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    StatusBadgeComponent,
    BtnComponent,
  ],
  templateUrl: './app-run-test.component.html',
  styleUrl: './app-run-test.component.scss'
})
export class AppRunTestComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly runService: TestRunService = inject(TestRunService);
  private readonly runTestEmbedService: ControllerSocketService = inject(ControllerSocketService);

  readonly app = input<AppDetailDto>();
  readonly appRunning = input<boolean>(false);
  readonly datafiles = input<string[]>([]);

  displayedColumns: string[] = ['position', 'status', 'error', 'startTime', 'appVersion'];
  dataSource: MatTableDataSource<TestRunDTO> = new MatTableDataSource();

  ngOnInit() {
    const app = this.app();
    if (app) {
      this.runService.getRuns(app.id).subscribe((runs) => {
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

  addNewTest(): void {
    const dialogRef = this.dialog.open(AppRunTestStartComponent, {
      minHeight: '500px',
      minWidth: '500px',
      width: '50vw',
      height: '50vh',
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
        console.log(result);
      }
    });
  }

  showDetail(run: TestRunDTO, index: number): void {
    const dialogRef = this.dialog.open(AppRunTestDetailComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: {app: this.app(), run: run, nr: index + 1},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result);
      }
    });
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
