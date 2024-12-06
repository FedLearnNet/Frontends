import { Component, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { SMALL } from '@shared-lib/constants';
import { SchemaService } from '@local-app/cohort/services/schema.service';
import { cloneDeep } from 'lodash';
import { Schema } from '@shared-lib/models';

@Component({
  selector: 'app-cohort-dashboard',
  templateUrl: './cohort-dashboard.component.html',
  styleUrl: './cohort-dashboard.component.scss',
})
export class CohortDashboardComponent implements OnInit {
  subscribedSchemaList: Schema[] = [];
  displayedColumns: string[] = ['actions', 'name', 'description'];
  isLargeScreen: boolean = true;
  screenSize: string;

  constructor(
      public dialog: MatDialog,

      private schemaService: SchemaService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({schemas}) => this.subscribedSchemaList = schemas);

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .isScreenSizeGreaterThan(SMALL)
        .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);

    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.screenSize = screenSize);
  }

  deleteRow(element: Schema): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete cohort',
        message: 'All patient data will be deleted.' +
          'Logs will be still visible.' +
          'Are you sure you want to delete this cohort?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.schemaService.deleteSchema(element.uniqueId).subscribe(() => {
        this.subscribedSchemaList = cloneDeep(this.subscribedSchemaList.filter(schema => schema.uniqueId !== element.uniqueId));
      });
    });
  }
}
