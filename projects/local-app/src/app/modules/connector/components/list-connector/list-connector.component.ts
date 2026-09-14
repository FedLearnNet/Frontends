import {Component, inject, input, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ConnectorService} from "../../services/connector-crud.service";
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
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ConnectorRunDialogComponent} from '../run-connector/components/run-dialog/run-dialog.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatMenu, MatMenuItem} from '@angular/material/menu';
import {MatPaginator} from '@angular/material/paginator';
import {
  ConnectorJsonEditorDialogComponent,
  EditConnectorJsonEditorData
} from "../manage-connector/components/connector-json-editor-dialog/connector-json-editor-dialog.component";
import {
  ConnectorCreateChoiceDialogComponent,
  ConnectorCreateChoice
} from "../manage-connector/components/connector-create-choice-dialog/connector-create-choice-dialog.component";
import {
  ConnectorImportDialogComponent,
  ConnectorImportDialogData
} from "../manage-connector/components/connector-import-dialog/connector-import-dialog.component";
import {CohortDetailDto} from '@local-app/cohort/models';
import {ConnectorDTO} from "../../dto/connector";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import { getCleanConnectorConfig } from '../../helper/connector-config-helper';


@Component({
  selector: 'app-list-connector',
  templateUrl: './list-connector.component.html',
  styleUrl: './list-connector.component.scss',
  imports: [MatTooltip, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, RouterLink, MatMenu, MatMenuItem, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, TranslatePipe, BadgeComponent, TimeBadgeComponent, StatusBadgeComponent, HeaderComponent, PageWrapperComponent, BtnComponent]
})
export class ListConnectorComponent implements OnInit {
  readonly cohortId = input<string>();
  private readonly cohort = signal<CohortDetailDto>({} as CohortDetailDto);

  baseRoute = 'connector';
  displayedColumns: string[] = ['name', 'source', 'last', 'actions'];
  connectors: ConnectorDTO[] = [];
  dataSource = new MatTableDataSource<ConnectorDTO>([]);

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private activatedRoute = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private connectorService = inject(ConnectorService);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.cohort.set(data['cohort']);
    })

    this.baseRoute = "cohort/" + this.cohortId() + "/connector";

    this.loadConnectors();
  }

  onAddClick(): void {
    this.dialog.open(ConnectorCreateChoiceDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
    }).afterClosed().subscribe((choice: ConnectorCreateChoice | undefined) => {
      if (choice === 'create') {
        this.router.navigate([this.baseRoute, 'new']);
        return;
      }

      if (choice === 'import') {
        this.openImportDialog();
      }
    });
  }

  private openImportDialog(): void {
    const cohortId = this.cohortId();
    if (!cohortId) {
      return;
    }

    this.dialog.open(ConnectorImportDialogComponent, {
      height: '70vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '80vh',
      autoFocus: false,
      data: {
        cohortId: cohortId.toString(),
      } satisfies ConnectorImportDialogData,
    }).afterClosed().subscribe((data: ConnectorDTO | undefined) => {
      if (!data) {
        return;
      }
      const idx = this.connectors.findIndex(c => c.id === data.id);
      if (idx !== -1) {
        this.connectors[idx] = data;
      } else {
        this.connectors.push(data);
      }
      this.dataSource.data = [...this.connectors];
    });
  }

  onEditClick(connectorId: number): void {
    this.router.navigate([this.baseRoute, 'edit', connectorId]);
  }

  onDuplicateClick(connectorId: number): void {
    this.router.navigate([this.baseRoute, 'new', connectorId]);
  }

  onDeleteClick(connectorId: number): void {
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
        this.loadConnectors();
      });
    });
  }

  onRunClick(connector: ConnectorDTO): void {
    const dialogRef = this.dialog.open(ConnectorRunDialogComponent, {
      data: {
        cohort: this.cohort(),
        connector: connector,
      },
    });

    dialogRef.afterClosed().subscribe((showRuns) => {
      if (!showRuns) {
        return;
      }

      this.router.navigate([this.baseRoute, 'view', connector.id]);
    });
  }

  asJSON(connector: ConnectorDTO): void {
    this.dialog.open(ConnectorJsonEditorDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {
        connector: getCleanConnectorConfig(connector),
        editable: false
      } as EditConnectorJsonEditorData
    });
  }

  getViewRoute(id: number): string {
    return `view/${id}`;
  }

  getFilesRoute(): string {
    return 'files';
  }

  private loadConnectors(): void {
    this.connectorService.getAll(this.cohortId()).pipe(
    ).subscribe(connectorsWithLastRun => {
      this.connectors = connectorsWithLastRun;
      this.dataSource.data = connectorsWithLastRun;

      this.dataSource.paginator?.firstPage();
    });
  }

  public convertStatus(status: string): StatusBadeType {
    if (status.toUpperCase() === "ERROR") return 'FAILED';
    if (status.toUpperCase() === "FINISHED") return 'SUCCESS';
    return "RUNNING";
  }
}
