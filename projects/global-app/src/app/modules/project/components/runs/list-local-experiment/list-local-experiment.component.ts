import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input, OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {AsyncPipe, CommonModule} from "@angular/common";
import {MatButton, MatButtonModule, MatIconButton} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuModule} from "@angular/material/menu";
import {MatToolbar, MatToolbarModule} from "@angular/material/toolbar";
import {ProjectExperimentService} from "@global-app/project/services/project-experiment-service";
import {MatDialog} from "@angular/material/dialog";
import {ProjectDto} from "@global-app/project/dto/project";
import {ProjectFederatedExperimentDTO, ProjectLocalExperimentDTO} from "@global-app/project/dto/project-experiments";
import {map, Observable} from "rxjs";
import {
  CreateExperimentComponent
} from "@global-app/project/components/runs/create-experiment/create-experiment.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-list-local-experiment',
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
  templateUrl: './list-local-experiment.component.html',
  styleUrl: './list-local-experiment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListLocalExperimentComponent implements OnInit, OnChanges {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly projectExperimentService: ProjectExperimentService = inject(ProjectExperimentService);
  private readonly dialog: MatDialog = inject(MatDialog);

  @Input() project?: ProjectDto;

  public displayedColumns: string[] = ['name', 'createdAt', 'description', 'status', 'action'];

  //Prevent Repeated Constructor Calls
  private dataSource: MatTableDataSource<ProjectLocalExperimentDTO> = new MatTableDataSource<ProjectLocalExperimentDTO>();
  public dataSource$: Observable<MatTableDataSource<ProjectLocalExperimentDTO>>
  public experiments$: Observable<ProjectLocalExperimentDTO[]>;


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
        forFederated: false
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
    this.experiments$ = this.projectExperimentService.getLocalFederatedExperiments(this.project!.id);
    this.dataSource$ = this.experiments$.pipe(map(projects => {
        const dataSource = this.dataSource;
        dataSource.data = projects;
        return dataSource;
      })
    );
  }
}
