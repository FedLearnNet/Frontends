import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ConnectorService} from "../../services/connector-crud.service";
import {ConnectorConfigDTO} from "../../models/connector-config";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-list-connector',
  templateUrl: './list-connector.component.html',
  styleUrl: './list-connector.component.scss'
})
export class ListConnectorComponent implements OnInit {
  @Input() schemaId?: string;

  baseRoute = 'connector';
  displayedColumns: string[] = ['name', 'source', 'schedule', 'last', 'actions'];
  connectors: ConnectorConfigDTO[] = [];
  dataSource: MatTableDataSource<ConnectorConfigDTO>;


  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private connectorService: ConnectorService) {
  }


  ngOnInit(): void {
    this.baseRoute = "cohort/" + this.schemaId + "/connector";

    this.connectorService.getAll(this.schemaId).subscribe((connectors) => {
      this.connectors = connectors;
      this.dataSource = new MatTableDataSource(this.connectors);
    });
  }

  onAddClick(): void {
    this.router.navigate([this.baseRoute, 'new']);
  }

  onEditClick(connectorId: number): void {
    this.router.navigate([this.baseRoute, 'edit', connectorId]);
  }

  onDuplicateClick(connectorId: number): void {
    this.router.navigate([this.baseRoute, 'new', connectorId]);
  }

  onDeleteClick(connectorId: number): void {
    console.log("onDeleteClick", connectorId);
    throw new Error("not Implemented")
  }

  onRunClick(connectorId: number): void {
    console.log("onDeleteClick", connectorId);
    throw new Error("not Implemented")
  }

  getViewRoute(id: number): string {
    return `view/${id}`;
  }
}
