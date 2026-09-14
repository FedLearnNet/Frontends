import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Data} from "@angular/router";
import {ConnectorRunDTO} from "../../dto/run";
import {ConnectorDTO} from "../../dto/connector";
import {RunLogsType} from '../../enum/run-logs';
import {CohortDetailDto} from '@local-app/cohort/models';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatTab, MatTabContent, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressBar} from '@angular/material/progress-bar';
import {RunConnectorChangeLogComponent} from './components/run-change-log/run-change-log.component';
import {RunConnectorLogComponent} from './components/run-log/run-log.component';
import {TranslatePipe} from '@ngx-translate/core';
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {ConnectorRunStep, ImportStatusEnum} from "../../dto/connector.enum";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {MatDialog} from '@angular/material/dialog';
import {
  PatientRollbackDialogComponent,
  PatientRollbackDialogData
} from '../../../patient/components/patient-rollback-dialog/patient-rollback-dialog.component';
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {interval, Subscription} from 'rxjs';
import {ConnectorRunService} from '../../services/run.service';

type RouteData = Data & { breadcrumb: string | any, run: ConnectorRunDTO, connector: ConnectorDTO }

@Component({
  selector: 'app-run-connector',
  templateUrl: './run-connector.component.html',
  styleUrl: './run-connector.component.scss',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatTabGroup, MatTab, MatTabLabel, MatTooltip, MatTabContent, RunConnectorChangeLogComponent, RunConnectorLogComponent, TranslatePipe, KvComponent, StatusBadgeComponent, TimeBadgeComponent, HeaderComponent, PageWrapperComponent, BtnComponent, MatProgressBar]
})
export class RunConnectorViewComponent implements OnInit, OnDestroy {
  private static readonly REFRESH_PERIOD = 5000;

  run?: ConnectorRunDTO = undefined;
  connector?: ConnectorDTO = undefined;

  cohort = signal<CohortDetailDto>({} as CohortDetailDto);

  get connectorCohortId(): string | undefined {
    return this.connector?.cohortId != null ? String(this.connector.cohortId) : undefined;
  }

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly connectorRunService = inject(ConnectorRunService);
  private refreshSub?: Subscription;

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      const routeData = data as RouteData;
      this.run = routeData.run;
      this.connector = routeData.connector;

      this.cohort.set(data['cohort'] ?? {} as CohortDetailDto);
      this.checkRunningAndStartRefresh();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadRun(): void {
    if (!this.run?.id) {
      return;
    }

    this.connectorRunService.get(this.run.id).subscribe((run) => {
      if (run) {
        this.run = run;
      }

      this.checkRunningAndStartRefresh();
    });
  }

  checkRunningAndStartRefresh(): void {
    const isRunning = this.run?.status === ImportStatusEnum.RUNNING;

    if (isRunning && !this.refreshSub) {
      this.refreshSub = interval(RunConnectorViewComponent.REFRESH_PERIOD).subscribe(() => this.loadRun());
    }

    if (!isRunning) {
      this.stopAutoRefresh();
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
      this.refreshSub = undefined;
    }
  }

  private static readonly STEP_ORDER: ConnectorRunStep[] = [
    ConnectorRunStep.EXTRACTING,
    ConnectorRunStep.TRANSFORMING,
    ConnectorRunStep.MAPPING,
    ConnectorRunStep.LOADING,
  ];

  /** Overall run progress as a clamped 0–100 percentage. */
  overallProgress(): number {
    return Math.min(Math.max(this.run?.progress ?? 0, 0), 100);
  }

  /** Human-readable label for the current pipeline step. */
  stepLabel(): string {
    if (this.run?.status === ImportStatusEnum.FINISHED) {
      return 'Finished';
    }

    switch (this.run?.currentStep) {
      case ConnectorRunStep.EXTRACTING:
        return 'Extracting source data';
      case ConnectorRunStep.TRANSFORMING:
        return 'Transforming patient data';
      case ConnectorRunStep.MAPPING:
        return 'Mapping patient data';
      case ConnectorRunStep.LOADING:
        return 'Loading patient changes';
      case ConnectorRunStep.FINISHED:
        return 'Finished';
      default:
        return 'Preparing run';
    }
  }

  /** Visual state of a step pill relative to the current step. */
  stepState(step: ConnectorRunStep): 'done' | 'active' | 'pending' {
    if (this.run?.status === ImportStatusEnum.FINISHED) {
      return 'done';
    }

    const order = RunConnectorViewComponent.STEP_ORDER;
    const currentIndex = order.indexOf(this.run?.currentStep as ConnectorRunStep);
    const stepIndex = order.indexOf(step);

    if (currentIndex < 0 || stepIndex < 0) {
      return 'pending';
    }
    if (stepIndex < currentIndex) {
      return 'done';
    }
    return stepIndex === currentIndex ? 'active' : 'pending';
  }

  /** True once the patient total is known and the per-patient drain has started. */
  hasPatientProgress(): boolean {
    return !!this.run?.expectedElements && !!this.run?.currentElementNr;
  }

  toDate(date: string): Date {
    return new Date(date);
  }

  openRollbackDialog(): void {
    if (!this.connector?.id || !this.run?.id) {
      return;
    }

    this.dialog.open(PatientRollbackDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {
        mode: 'CONNECTOR_RUN',
        connectorId: this.connector.id,
        connectorName: this.connector.name,
        runId: this.run.id,
      } as PatientRollbackDialogData
    });
  }

  public convertStatus(status?: ImportStatusEnum): StatusBadeType {
    if (!status) {
      return "INIT";
    }
    if (status.toUpperCase() === "ERROR") return 'FAILED';
    if (status.toUpperCase() === "FINISHED") return 'SUCCESS';
    return "RUNNING";

  }

  protected readonly RunLogsType = RunLogsType;
  protected readonly ImportStatusEnum = ImportStatusEnum;
  protected readonly ConnectorRunStep = ConnectorRunStep;
}
