import {Component, inject, OnInit} from '@angular/core';
import {
  MatTableDataSource
} from "@angular/material/table";
import {EMPTY, map, Observable, Subscription} from "rxjs";
import {ControllerStatusDto} from "@shared-lib/controller/dto";
import {ProjectDetailDto, ProjectDto, ProjectStatus} from "../../dto/project";
import {UserDto} from "@shared-lib/base/user";
import {ProjectService} from "@global-app/project/services/project-service";
import {MatDialog} from "@angular/material/dialog";
import {JoinProjectDialogComponent} from "../join-project/join-project.component";
import {
  CreateExperimentComponent
} from "@global-app/project/components/runs/create-experiment/create-experiment.component";
import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {CreateProjectComponent} from "@global-app/project/components/create-project/create-project.component";

@Component({
  selector: 'app-list-projects',
  templateUrl: './list-projects.component.html',
  styleUrl: './list-projects.component.scss'
})
export class ProjectListsComponent implements OnInit {

  readonly dialog = inject(MatDialog);
  readonly projectService: ProjectService = inject(ProjectService);


  public controllerStatus$: Observable<ControllerStatusDto> = EMPTY;
  public displayedColumns: string[] = ['name', 'createdAt', 'description', 'status', 'action'];

  //Prevent Repeated Constructor Calls
  private dataSource: MatTableDataSource<ProjectDto> = new MatTableDataSource<ProjectDto>();

  public dataSource$: Observable<MatTableDataSource<ProjectDto>>
  public projects$: Observable<ProjectDto[]>;


  private readonly userSub: Subscription;
  private interval: any = undefined;

  public projects: ProjectDto[] | undefined = undefined;
  public user: UserDto | undefined = undefined;

  public markedProjectID: number = 0;

  /*
  public constructor(
    //TODO private userService: UserService,
    //TODO private store: Store
  ) {
  }
*/
  ngOnInit(): void {
    this.getProjects();


    //TODO
    /*this.userSub = this.userService.subscribeUser(async (user: UserJson | undefined): Promise<void> => {
      this.user = user;

      if (this.interval === undefined && this.user !== undefined) {
        // Do a first read and then start refresh
        await this.getProjects();
        this.startInterval();
      }
    });*/
  }

  /*
  ngOnDestroy(): void {
   // this.userSub.unsubscribe();
   // this.clearInterval();
  }*/


  public getProjects() {

    this.projects$ = this.projectService.getProjects();
    this.dataSource$ = this.projects$.pipe(map(projects => {
        const dataSource = this.dataSource;
        dataSource.data = projects;
        return dataSource;
      })
    );

    //if (this.user !== undefined && this.user?.site !== null) {
    //TODO       const projects: ProjectDto[] | ErrorServerResponseDto = await this.projectService.getProjects();
    //  const projects: ProjectDto[] = await this.projectService.getProjects();
    //if (projects instanceof ErrorServerResponseDto) {
    //TODO toastError('Loading projects failed.', projects);

    // return;
    //}
    //  this.projects = projects;
    //}
  }


  public async leaveProject(): Promise<void> {
    if (this.markedProjectID === 0) {
      return;
    }
    this.projectService.deleteProject(this.markedProjectID);
    await this.getProjects();
  }

  newProject(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent);
    dialogRef.afterClosed().subscribe((project: ProjectDetailDto) => {
      if(project){
        this.getProjects(); //TODO
      }
    });
  }

  public joinProject(): void {
    const dialogRef = this.dialog.open(JoinProjectDialogComponent);

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
      this.getProjects();
    });
  }
}
