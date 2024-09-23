import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Data} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {RunDTO} from "../../dto/run";
import {ConnectorConfig} from "../../models/connector-config";

type RouteData = Data & { breadcrumb: string | any, run: RunDTO, connector: ConnectorConfig}

@Component({
  selector: 'app-run-connector',
  templateUrl: './run-connector.component.html',
  styleUrl: './run-connector.component.scss',
})
export class RunConnectorViewComponent implements OnInit {

  run?: RunDTO = undefined;
  connector?: ConnectorConfig = undefined;

  constructor(private activatedRoute: ActivatedRoute,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      const routeData = data as RouteData;
      this.run = routeData.run;
      this.connector = routeData.connector;
    });
  }
}
