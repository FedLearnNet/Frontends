import { Component, Inject, OnInit } from '@angular/core';
import { Application } from '@global-app/find-data/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { QueryService } from '@global-app/find-data/services/query.service';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { LARGE, MEDIUM, SMALL, XLARGE, XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-application-grid',
  templateUrl: './application-grid.component.html',
  styleUrl: './application-grid.component.scss',
})
export class ApplicationGridComponent implements OnInit {
  cols: number = 3;
  rowHeight: string = '3:4'
  screenSize: string = LARGE;
  applications: Application[] = [];
  selectedApplications: Application[];

  constructor(
      public dialogRef: MatDialogRef<ApplicationGridComponent>,

      @Inject(MAT_DIALOG_DATA) public data: any,

      private queryService: QueryService,
      private responsiveService: ResponsiveService,
  ) {
  }

  ngOnInit(): void {
    this.selectedApplications = cloneDeep(this.data.applications);

    this.getApplications();
    this.checkAndAdjustResponsiveLayout();
  }

  getApplications(): void {
    this.queryService.getAllApplications().subscribe(applications => this.applications = applications);
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => {
          this.screenSize = screenSize;
          switch (screenSize) {
            case XLARGE:
              this.cols = 4;
              this.rowHeight = '3:4';
              break;
            case LARGE:
              this.cols = 3;
              this.rowHeight = '3:4';
              break;
            case MEDIUM:
              this.cols = 2;
              this.rowHeight = '3:4';
              break;
            case SMALL:
              this.cols = 2;
              this.rowHeight = '3:5';
              break;
            case XSMALL:
              this.cols = 1;
              this.rowHeight = '3:4';
              break;
            default:
              this.cols = 2;
              this.rowHeight = '3:4';
          }
        });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.selectedApplications);
  }

  getSubmitButtonLabel(): string {
    if (this.selectedApplications?.length !== 0) {
      return 'Update workflow applications';
    }

    return 'Add applications to workflow';
  }

  isApplicationAdded(applicationId: number): boolean {
    if (!this.selectedApplications) return false;

    return !!this.selectedApplications.find(application => application.id === applicationId);
  }

  onAddApplication(applicationId: number): void {
    this.selectedApplications.push({
      ...this.applications.find(application => application.id === applicationId) as Application,
      position: this.selectedApplications.length,
    });
  }
}
