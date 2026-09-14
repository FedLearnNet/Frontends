import {Component, inject, input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {FederatedRunService} from "../../../../service/federated-run.service";
import {FederatedTestRunDTO} from "../../../../dto/federated-test-run";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {ControllerSocketService} from "../../../../service/testembed-socket.service";
import {TranslatePipe} from "@ngx-translate/core";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {
  AppRunFederatedTestStartComponent
} from "../app-run-federated-test-start/app-run-federated-test-start.component";
import {LocalFiles} from "@shared-lib/modules/files/dto/file";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-app-run-federated-test',
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    StatusBadgeComponent,
    TimeBadgeComponent,
    BtnComponent,
  ],
  templateUrl: './app-run-federated-test.component.html',
  styleUrl: './app-run-federated-test.component.scss'
})
export class AppRunFederatedTestComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly federatedRunService: FederatedRunService = inject(FederatedRunService);
  private readonly socketService: ControllerSocketService = inject(ControllerSocketService);
  private readonly router: Router = inject(Router);

  readonly app = input<AppDetailDto>();
  readonly appRunning = input<boolean>(false);
  readonly localFiles = input<LocalFiles[]>([]);

  displayedColumns: string[] = ['position', 'status', 'participants', 'error', 'startTime'];
  dataSource: MatTableDataSource<FederatedTestRunDTO> = new MatTableDataSource();

  ngOnInit() {
    const app = this.app();
    if (!app) return;

    this.federatedRunService.getRuns(app.id).subscribe((runs) => {
      this.dataSource.data = runs;
    });

    this.socketService.getFederatedRunCreated$().subscribe((run) => this.updateOrAddRun(run));
    this.socketService.getFederatedRunUpdate$().subscribe((run) => this.updateOrAddRun(run));
  }

  updateOrAddRun(run: FederatedTestRunDTO): void {
    const data = this.dataSource.data;
    const existing = data.find((r) => r.id === run.id);
    if (existing === undefined) {
      this.dataSource.data = [run, ...data];
    } else {
      this.dataSource.data = data.map((r) => r.id === run.id ? {...r, ...run} : r);
    }
  }

  participantCount(run: FederatedTestRunDTO): number {
    return run.participants?.length ?? 0;
  }

  addNewFederatedTest(): void {
    const dialogRef = this.dialog.open(AppRunFederatedTestStartComponent, {
      minHeight: '500px',
      minWidth: '700px',
      width: '65vw',
      maxWidth: '95vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {
        app: this.app(),
        datafiles: this.localFiles().map(file => file.path),
      },
    });

    dialogRef.afterClosed().subscribe(() => {
    });
  }

  showDetail(run: FederatedTestRunDTO): void {
    const appId = this.app()?.id;
    if (!appId) return;
    this.router.navigate(['/app', appId, 'test', 'federated', run.id]);
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
