 import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Data, Router} from "@angular/router";
import {ConnectorService} from "../../services/connector-crud.service";
import {ConnectorConfig, ConnectorConfigDTO} from "../../models/connector-config";
import {ConnectorRunService} from "../../services/run.service";
import {RunDTO} from "../../dto/run";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {ConnectorRunDialogComponent} from "../run-connector/components/run-dialog/run-dialog.component";
import {MatDialog} from "@angular/material/dialog";


type RouteData = Data & { breadcrumb: string | any, connector: ConnectorConfig }


@Component({
  selector: 'app-view-connector',
  templateUrl: './view-connector.component.html',
  styleUrl: './view-connector.component.scss'
})
export class ViewConnectorComponent implements OnInit {
  @Input() schemaId?: string | null;

  baseRoute = 'connector';
  connector: ConnectorConfig;
  runs: RunDTO[] = [];

  editModes: Record<string, boolean> = {
    name: false,
    description: false,
    inputSchedule: false
  }

  runDataSource: MatTableDataSource<RunDTO>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedRunColumns: string[] = ['id', 'status', 'date', 'newEntities', 'deletedEntities',
    'updatedEntities', 'failedEntities', 'unchangedEntities', 'action'];

  constructor(private activatedRoute: ActivatedRoute,
              private connectorService: ConnectorService,
              private router: Router,
              public dialog: MatDialog,
              private connectorRunService: ConnectorRunService) {
  }

  ngOnInit(): void {
    this.baseRoute =  "cohort/" + this.schemaId + "/connector";

    this.activatedRoute.data.subscribe(data => {
      const routeData = data as RouteData;
      this.connector = routeData.connector;
      this.loadRuns();
    });
  }

  loadRuns(): void {
    this.connectorRunService.getAllForConnector(this.connector.id!).subscribe((runs) => {
      this.runs = runs;
      this.runDataSource = new MatTableDataSource(this.runs);
      this.runDataSource.paginator = this.paginator;

    });
  }

  toggleEditMode(field: string): void {
    this.editModes[field] = !this.editModes[field];
  }

  save(field: string): void {

    const patchFields: ConnectorConfigDTO = {
      id: this.connector.id,
      name: this.connector.name!,
      description: this.connector.description!
    };

    this.connectorService.patch(patchFields).subscribe(() => {
      this.toggleEditMode(field);
    });
  }

  onEditClick(): void {
    this.router.navigate([this.baseRoute, 'edit', this.connector.id!]);
  }

  onDuplicateClick(): void {
    this.router.navigate([this.baseRoute, 'new', this.connector.id!]);
  }

  onViewClick(run: RunDTO): void {
    this.router.navigate([this.baseRoute, 'view', this.connector.id!, 'run', run.id!]);
  }
  onDeleteClick(): void {

  }

  onRunClick(): void {
    const dialogRef = this.dialog.open(ConnectorRunDialogComponent, {
      data: this.connector,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate([this.baseRoute, 'view', this.connector.id!]);
    });
  }
}
