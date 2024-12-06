import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  inject,
  Input, OnChanges,
  OnInit, Output,
  SimpleChanges
} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {AppDto} from "../../../../../app-store/dto/app";
import {MatDialog} from "@angular/material/dialog";
import {AppSelectDialogComponent} from "./components/app-select-dialog/app-select-dialog.component";
import {AppService} from "@global-app/app-store/service/app.service";
import {forkJoin} from "rxjs";
import {ProjectDetailDto, ProjectDto} from "@global-app/project/dto/project";
import {WorkflowElementDto} from "@global-app/project/dto/workflow";
import {
  AppDetailDialogComponent
} from "@global-app/project/components/detail-project/components/detail-project-workflow/components/app-detail-dialog/app-detail-dialog.component";
import {ProjectService} from "@global-app/project/services/project-service";

@Component({
  selector: 'app-detail-project-workflow',
  templateUrl: './detail-project-workflow.component.html',
  styleUrl: './detail-project-workflow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailProjectWorkflowComponent implements OnInit, OnChanges {
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly appService: AppService = inject(AppService);
  private readonly projectService: ProjectService = inject(ProjectService);

  @Input() project: ProjectDetailDto;
  @Output() projectChange: EventEmitter<ProjectDto> = new EventEmitter<ProjectDto>();

  workflow: WorkflowElementDto[] = []
  allApps: AppDto[] = []
  myApps: AppDto[] = []

  ngOnInit() {
    if (!this.project) {
      throw new Error('Project is not defined');
    }
    this.workflow = this.project.workflow?.sort(
      (a, b) => a.orderValue - b.orderValue
    ) || [];
    forkJoin({
      allApps: this.appService.getApps(),
      myApps: this.appService.getMyApps()
    }).subscribe(({allApps, myApps}) => {
      this.allApps = allApps;
      this.myApps = myApps;
      this.allApps.push(...myApps);
      this.workflow = this.workflow.map((workflowElement) => {
        if (this.myApps.find(app => app.id === workflowElement.federatedAppId)) {
          workflowElement.isPrivateApp = true;
        }
        return workflowElement;
      });
      this.cdr.detectChanges();
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["project"] && !changes["project"].firstChange) {
      this.project = changes["project"].currentValue;
    }
  }

  getAppById(id: number): AppDto | undefined {
    if (!id || !this.allApps) {
      return undefined;
    }
    return this.allApps.find(app => app.id === id) as AppDto;
  }

  isAppValid(app: WorkflowElementDto): boolean {
    const relevantApp = this.getAppById(app.federatedAppId);
    if (!relevantApp) {
      return false;
    }
    return !!(app.hyperParams && Object.keys(app).length > 0);
  }

  appCardEditClicked(app: WorkflowElementDto): void {
    const dialogRef = this.dialog.open(AppDetailDialogComponent, {
      width: '1200px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: {
        app: this.getAppById(app.federatedAppId),
        step: app
      }
    });
    dialogRef.afterClosed().subscribe((result?: WorkflowElementDto| boolean) => {
      if (result !== undefined) {
        if (result === false) {
          this.workflow = this.workflow.filter((workflowElement) => workflowElement.orderValue !== app.orderValue);
          this.updateProject();
          return;
        }
        this.workflow = this.workflow.map((workflowElement) => {
          if (workflowElement.orderValue === app.orderValue) {
            return result as WorkflowElementDto;
          }
          return workflowElement;
        });
        this.updateProject();
      }
    });
  }

  updateProject(replace?:boolean): void {
    this.project.workflow = this.workflow;
    this.projectService.updateProject(this.project).subscribe((project) => {
      this.project = project;
      if(replace){
        this.workflow = project.workflow || [];
      }
      this.projectChange.emit(project);
      this.cdr.detectChanges();
    });
  }

  drop(event: CdkDragDrop<WorkflowElementDto[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.cdr.detectChanges();
    this.updateProject();
  }

  openShopDialog(type: string): void {
    const dialogRef = this.dialog.open(AppSelectDialogComponent,
      {
        width: '980px',
        height: '100%',
        position: {top: '0', right: '0'},
      });

    dialogRef.afterClosed().subscribe((result?: AppDto) => {
      if (result) {
        this.workflow.push(this.createWorkflowElement(result, type));
        this.cdr.detectChanges();
        this.updateProject();
      }
    });
  }

  createWorkflowElement(result: AppDto, type: string): WorkflowElementDto {
    const workflowElement: WorkflowElementDto = {
      projectId: this.project.id,
      federatedAppId: result.id,
      federatedAppVersionId: result.latestVersionId,
      orderValue: this.workflow.length,
    } as WorkflowElementDto;
    if (type === 'plugin') {
      workflowElement.isPlugin = true;
    }
    if (type === 'private') {
      workflowElement.isPrivateApp = true;
    }
    return workflowElement;
  }

  isNextStepOnTheSameLine(type: string, index: number, manipulator: number = +1): boolean {
    const app = this.workflow[index + manipulator];
    if (type === 'private' && app?.isPrivateApp) {
      return true;
    }
    return type === 'public' && !app?.isPlugin && !app?.isPrivateApp;

  }


}
