import {Component, inject, input, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {ActivatedRoute, Data, Router} from "@angular/router";
import {ConnectorService} from "../../services/connector-crud.service";
import {configToConnectorDTO} from "../../models/connector-config";
import {ConnectorDTO, ConnectorTriggerTypeEnum} from "../../dto/connector";
import {ConnectorRunService} from "../../services/run.service";
import {ConnectorRunDTO} from "../../dto/run";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {ConnectorRunDialogComponent} from "../run-connector/components/run-dialog/run-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {interval, Subscription} from 'rxjs';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatMenu, MatMenuItem} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatOption, MatSelect} from '@angular/material/select';
import {
  ConnectorJsonEditorDialogComponent,
  EditConnectorJsonEditorData
} from "../manage-connector/components/connector-json-editor-dialog/connector-json-editor-dialog.component";
import {CohortDetailDto} from '@local-app/cohort/models';
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import { getCleanConnectorConfig } from '../../helper/connector-config-helper';

type RouteData = Data & { breadcrumb: string | any, connector: ConnectorDTO, cohort: CohortDetailDto }

@Component({
  selector: 'app-view-connector',
  templateUrl: './view-connector.component.html',
  styleUrl: './view-connector.component.scss',
  imports: [MatButton, MatTooltip, MatIcon, MatMenu, MatMenuItem, MatFormField, MatLabel, MatInput, FormsModule, MatIconButton, MatSuffix, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, TranslatePipe, StatusBadgeComponent, TimeBadgeComponent, HeaderComponent, PageWrapperComponent, MatSlideToggle, MatSelect, MatOption, BtnComponent]
})
export class ViewConnectorComponent implements OnInit, OnDestroy {
  private static readonly REFRESH_PERIOD = 5000;
  private static readonly DEFAULT_CRON_EXPRESSION = '0 2 * * *';

  readonly cohortId = input<string | null>();

  private readonly cohort = signal<CohortDetailDto>({} as CohortDetailDto);

  connector?: ConnectorDTO;
  availableTriggerConnectors: ConnectorDTO[] = [];
  savingAutomationSettings = false;
  showAutomationSettings = false;
  showCronHelp = false;
  runs: ConnectorRunDTO[] = [];

  editModes: Record<string, boolean> = {
    name: false,
    description: false,
    inputSchedule: false
  }

  runDataSource: MatTableDataSource<ConnectorRunDTO>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedRunColumns: string[] = ['id', 'status', 'date', 'newEntities', 'deletedEntities',
    'updatedEntities', 'failedEntities', 'unchangedEntities', 'action'];

  private refreshSub?: Subscription;
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private activatedRoute = inject(ActivatedRoute);
  private connectorService = inject(ConnectorService);
  private translateService = inject(TranslateService);
  private connectorRunService = inject(ConnectorRunService);

  get baseRoute(): string {
    return `cohort/${this.cohortId()}/connector`;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      const routeData = data as RouteData;
      this.connector = routeData.connector;
      this.loadRuns();
      this.loadTriggerConnectors(routeData.cohort?.id);

      this.cohort.set(routeData.cohort);
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadRuns(): void {
    if (!this.connector?.id) return;

    this.connectorRunService.getAllForConnector(this.connector.id).subscribe((results) => {
      const validRuns = results.filter(Boolean);

      this.runs = validRuns as ConnectorRunDTO[];
      this.runDataSource = new MatTableDataSource(this.runs);
      this.runDataSource.paginator = this.paginator;

      this.checkRunningAndStartRefresh();
    });
  }

  toggleEditMode(field: string): void {
    this.editModes[field] = !this.editModes[field];
  }

  save(field: string): void {
    if (!this.connector) return;

    this.connectorService.patch(configToConnectorDTO(this.connector)).subscribe((connector) => {
      this.connector = {
        ...this.connector!,
        version: connector.version ?? this.connector?.version,
        updatedAt: connector.updatedAt ?? this.connector?.updatedAt,
      };
      this.toggleEditMode(field);
    });
  }

  saveAutomationSettings(): void {
    if (!this.connector) return;

    this.savingAutomationSettings = true;
    this.connectorService.patch(configToConnectorDTO(this.connector)).subscribe({
      next: (connector) => {
        this.connector = {
          ...this.connector!,
          version: connector.version ?? this.connector?.version,
          updatedAt: connector.updatedAt ?? this.connector?.updatedAt,
        };
        this.savingAutomationSettings = false;
      },
      error: () => {
        this.savingAutomationSettings = false;
      }
    });
  }

  toggleAutomationSettings(): void {
    this.showAutomationSettings = !this.showAutomationSettings;
  }

  toggleCronHelp(): void {
    this.showCronHelp = !this.showCronHelp;
  }

  onEditClick(): void {
    if (!this.connector?.id) return;

    this.router.navigate([this.baseRoute, 'edit', this.connector.id!]);
  }

  onDuplicateClick(): void {
    if (!this.connector?.id) return;

    this.router.navigate([this.baseRoute, 'new', this.connector.id!]);
  }

  onViewClick(run: ConnectorRunDTO): void {
    if (!this.connector?.id) return;

    this.router.navigate([this.baseRoute, 'view', this.connector.id!, 'run', run.id!]);
  }

  onDeleteClick(): void {
    if (!this.connector?.id) return;

    const connectorId = this.connector.id;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translateService.instant('DIALOG.DELETE_CONNECTOR.TITLE'),
        message: this.translateService.instant('DIALOG.DELETE_CONNECTOR.MESSAGE'),
        dismissButtonText: this.translateService.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translateService.instant('BUTTON.DELETE'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.connectorService.delete(connectorId).subscribe(() => {
        this.router.navigate([this.baseRoute]);
      });
    });
  }

  onRunClick(): void {
    if (!this.connector) return;

    const dialogRef = this.dialog.open(ConnectorRunDialogComponent, {
      data: {
        cohort: this.cohort(),
        connector: this.connector,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadRuns();
    });
  }

  asJSON(): void {
    if (!this.connector) return;

    this.dialog.open(ConnectorJsonEditorDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '80vh',
      autoFocus: false,
      data: {
        connector: getCleanConnectorConfig(configToConnectorDTO(this.connector)),
        editable: false
      } as EditConnectorJsonEditorData
    });
  }

  checkRunningAndStartRefresh(): void {
    const hasRunning = this.runDataSource.data.some(row => row.status === 'RUNNING');

    if (hasRunning && !this.refreshSub) {
      this.refreshSub = interval(ViewConnectorComponent.REFRESH_PERIOD).subscribe(() => this.loadRuns());
    }

    if (!hasRunning) {
      this.stopAutoRefresh();
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
      this.refreshSub = undefined;
    }
  }

  loadTriggerConnectors(cohortId?: number): void {
    this.connectorService.getAll(cohortId?.toString()).subscribe((connectors) => {
      this.availableTriggerConnectors = connectors.filter(connector => connector.id !== this.connector?.id);
    });
  }

  isScheduleEnabled(): boolean {
    return !!this.connector?.scheduleSettings?.enabled;
  }

  onScheduleEnabledChange(enabled: boolean): void {
    if (!this.connector) return;

    this.connector.scheduleSettings = {
      ...this.connector.scheduleSettings,
      enabled,
      cronExpression: this.connector.scheduleSettings?.cronExpression || ViewConnectorComponent.DEFAULT_CRON_EXPRESSION,
    };
  }

  onCronExpressionChange(cronExpression: string): void {
    if (!this.connector) return;

    this.connector.scheduleSettings = {
      ...this.connector.scheduleSettings,
      enabled: this.connector.scheduleSettings?.enabled ?? true,
      cronExpression,
    };
  }

  isTriggerEnabled(): boolean {
    return !!this.connector?.triggerSettings?.type;
  }

  onTriggerEnabledChange(enabled: boolean): void {
    if (!this.connector) return;

    if (!enabled) {
      this.connector.triggerSettings = undefined;
      return;
    }

    this.connector.triggerSettings = {
      type: ConnectorTriggerTypeEnum.ON_CONNECTOR_SUCCESS,
      sourceConnectorId: this.connector.triggerSettings?.sourceConnectorId ?? this.availableTriggerConnectors[0]?.id,
    };
  }

  onTriggerSourceChange(sourceConnectorId: number): void {
    if (!this.connector) return;

    this.connector.triggerSettings = {
      type: ConnectorTriggerTypeEnum.ON_CONNECTOR_SUCCESS,
      sourceConnectorId,
    };
  }

  getTriggerConnectorName(sourceConnectorId?: number): string {
    return this.availableTriggerConnectors.find(connector => connector.id === sourceConnectorId)?.name ?? 'No connector selected';
  }

  public convertStatus(status: string): StatusBadeType {
    if (status.toUpperCase() === "ERROR") return 'FAILED';
    if (status.toUpperCase() === "FINISHED") return 'SUCCESS';
    return "RUNNING";

  }
}
