import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryService } from '@global-app/find-data/services/query.service';
import { Location } from '@angular/common';
import { Application, Query, Workflow, WorkflowStatus } from '@global-app/find-data/models';
import { MatTable } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { isNull, isEmpty, isUndefined } from 'lodash';
import { ApplicationGridComponent } from '@global-app/find-data/components/workflow-dashboard/components/workflow-detail/components/application-grid/application-grid.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html',
  styleUrl: './workflow-detail.component.scss',
})
export class WorkflowDetailComponent {
  query: Query;
  workflow: Workflow;
  workflowApplications: Application[] = [];
  displayedColumns: string[] = ['actions', 'name', 'description'];
  workflowStatuses: string[];
  isXSmallScreen: boolean = false;

  @ViewChild(MatTable) table: MatTable<Application>;

  workflowDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  constructor(
      public dialog: MatDialog,

      private router: Router,
      private location: Location,
      private formBuilder: FormBuilder,
      private queryService: QueryService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({query, workflowStatuses}) => {
      this.patchQuery(query);
      this.workflowStatuses = workflowStatuses;
    });

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  patchQuery(query: Query): void {
    this.query = query;

    if (!this.activatedRoute.snapshot.params['workflow-id']) return;

    this.workflow = query.workflows
        .find(workflow => workflow.id === parseInt(this.activatedRoute.snapshot.params['workflow-id'])) as Workflow;
    this.workflowApplications = this.workflow.applications ?? [];
    this.workflowDetailForm.patchValue(this.workflow);

    this.checkWorkflowStatus();
  }

  onGoBack(): void {
    this.location.back();
  }

  getWorkflowDetailPageTitle(): string {
    if (this.workflow) {
      return `${this.query.name} - ${this.workflow.name}`;
    }

    return 'New workflow'
  }

  onBrowseApps(): void {
    const dialogRef = this.dialog.open(ApplicationGridComponent, {
      minWidth: '70%',
      data: {
        applications: this.workflowApplications,
      },
    });

    dialogRef.afterClosed().subscribe((selectedApplications) => {
      if (isUndefined(selectedApplications)) return;

      this.workflowApplications = selectedApplications;
    });
  }

  onRequestTraining(): void {
    this.queryService.workflowRequestTraining(
        parseInt(this.activatedRoute.snapshot.params['query-id']),
        parseInt(this.activatedRoute.snapshot.params['workflow-id']),
    ).subscribe(workflow => {
      this.workflow = workflow;
      this.workflowApplications = workflow.applications;
      this.workflowDetailForm.patchValue(this.workflow);

      this.checkWorkflowStatus();
    });
  }

  onStartTraining(): void {
    console.log('### ON START TRAINING');
  }

  dropTable(event: CdkDragDrop<Application[]>): void {
    this.handlePositionChange(event.item.data.id, event.item.data.position, event.currentIndex);
  }

  onArrowUpward(applicationId: number): void {
    const selectedApplication = this.workflowApplications
        .find(application => application.id === applicationId) as Application;

    if (isNull(selectedApplication.position)
        || selectedApplication.position === 0) return;

    this.handlePositionChange(
        applicationId,
        selectedApplication.position ,
        selectedApplication.position - 1
    );
  }

  onArrowDownward(applicationId: number): void {
    const selectedApplication = this.workflowApplications
        .find(application => application.id === applicationId) as Application;

    if (isNull(selectedApplication.position)
        || selectedApplication.position === this.workflowApplications.length - 1) return;

    this.handlePositionChange(
        applicationId,
        selectedApplication.position,
        selectedApplication.position + 1
    );
  }

  handlePositionChange(applicationId: number, prevPosition: number, nextPosition: number): void {
    moveItemInArray(this.workflowApplications, prevPosition, nextPosition);

    this.workflowApplications.map((application, index) => application.position = index);

    this.table.renderRows();
  }

  onDelete(applicationId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove application',
        message: 'Are you sure you want to remove this application?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Remove',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.workflowApplications = this.workflowApplications.filter(application => application.id !== applicationId);
    });
  }

  getConfirmButtonLabel(): string {
    return `${isUndefined(this.workflow?.id) ? 'Create' : 'Update'} workflow`;
  }

  onSubmitWorkflow(): void {
    this.workflowDetailForm.markAllAsTouched();

    if (this.workflowDetailForm.invalid) return;

    if (isUndefined(this.workflow?.id)) {
      this.queryService.createNewWorkflow(
          parseInt(this.activatedRoute.snapshot.params['query-id']),
          {
            ...this.workflow,
            ...this.workflowDetailForm.getRawValue(),
            applications: this.workflowApplications,
          } as Workflow
      ).subscribe(() =>
          this.router.navigate(['find-data', this.activatedRoute.snapshot.params['query-id'], 'workflows'])
      );

      return;
    }

    this.queryService.updateWorkflow(
        parseInt(this.activatedRoute.snapshot.params['query-id']),
        {
          ...this.workflow,
          ...this.workflowDetailForm.getRawValue(),
          applications: this.workflowApplications,
        } as Workflow
    ).subscribe(() =>
        this.router.navigate(['find-data', this.activatedRoute.snapshot.params['query-id'], 'workflows'])
    );
  }

  getWorkflowStatus(): string {
    if (!this.workflow?.status) return WorkflowStatus[WorkflowStatus.New];

    return this.workflowStatuses[this.workflow.status];
  }

  getWorkflowStatusRemark(): string {
    if (isNull(this.query.result.holders)) return '-';

    if (isUndefined(this.workflow?.approved) || isNull(this.workflow.approved.datasets)) {
      return `${ this.query.result.datasets } datasets from ${ this.query.result.holders } data holders`;
    }

    return `${ this.workflow.approved.datasets }/${ this.query.result.datasets } datasets from 
      ${ this.workflow.approved.holders }/${ this.query.result.holders } data holders`;
  }

  isWorkflowDisabled(): boolean {
    if (isUndefined(this.workflow)) return false;

    return this.workflow?.status !== WorkflowStatus.New;
  }

  checkWorkflowStatus(): void {
    if (this.workflow.status === WorkflowStatus.New) return;

    this.workflowDetailForm.disable();
  }

  isRequestTrainingDisabled(): boolean {
    return isEmpty(this.workflow?.applications) || isUndefined(this.workflow?.id);
  }
}
