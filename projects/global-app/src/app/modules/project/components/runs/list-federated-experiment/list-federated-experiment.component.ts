import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input, OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {
  MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {map, Observable} from "rxjs";
import {ProjectDto} from "@global-app/project/dto/project";
import {RouterLink} from "@angular/router";
import {ProjectFederatedExperimentDTO} from "@global-app/project/dto/project-experiments";
import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {MatDialog} from "@angular/material/dialog";
import {QueryDTO} from "@global-app/find-data/dto/query";
import {
  CreateExperimentComponent
} from "@global-app/project/components/runs/create-experiment/create-experiment.component";

@Component({
  selector: 'app-list-federated-experiment',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    RouterLink,
  ],
  templateUrl: './list-federated-experiment.component.html',
  styleUrl: './list-federated-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFederatedExperimentComponent implements OnInit, OnChanges {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly projectExperimentService: ProjectExperimentService = inject(ProjectExperimentService);
  private readonly dialog: MatDialog = inject(MatDialog);

  @Input() project?: ProjectDto;

  public displayedColumns: string[] = ['name', 'createdAt', 'description', 'status', 'action'];

  //Prevent Repeated Constructor Calls
  private dataSource: MatTableDataSource<ProjectFederatedExperimentDTO> = new MatTableDataSource<ProjectFederatedExperimentDTO>();
  public dataSource$: Observable<MatTableDataSource<ProjectFederatedExperimentDTO>>
  public experiments$: Observable<ProjectFederatedExperimentDTO[]>;


  ngOnInit() {
    if (!this.project) {
      return;
    }
    this.getExperiment();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["project"] && !changes["project"].firstChange) {
      this.project = changes["project"].currentValue;
    }
  }

  newExperiment(): void {
    const dialogRef = this.dialog.open(CreateExperimentComponent, {
      data: {
        project: this.project,
        forFederated: true
      }
    });
    dialogRef.afterClosed().subscribe((newExperiment: ProjectExperimentService) => {
      if (!newExperiment) return;
      //TODO
      this.getExperiment();
      this.cdr.detectChanges();
    });
  }


  public getExperiment() {
    this.experiments$ = this.projectExperimentService.getProjectFederatedExperiments(this.project!.id);
    this.dataSource$ = this.experiments$.pipe(map(projects => {
        const dataSource = this.dataSource;
        dataSource.data = projects;
        return dataSource;
      })
    );
  }

}
