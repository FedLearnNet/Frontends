import {Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {ProjectDetailDto} from "../../dto/project";
import {MatDialog} from "@angular/material/dialog";
import {CreateProjectComponent} from "@global-app/project/components/create-project/create-project.component";
import {projectStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {TranslatePipe} from "@ngx-translate/core";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {RouterLink} from "@angular/router";
import {Store} from "@ngrx/store";
import {ProjectActions} from "@global-app/project/store/project.actions";
import {selectProjects} from "@global-app/project/store/project.selectors";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

@Component({
  selector: 'app-list-projects',
  templateUrl: './list-projects.component.html',
  imports: [
    MatTableModule,
    TranslatePipe,
    StatusBadgeComponent,
    RouterLink,
    TimeBadgeComponent,
    HeaderComponent
  ],
  styleUrl: './list-projects.component.scss'
})
export class ProjectListsComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  public displayedColumns: string[] = ['name', 'createdAt', 'description', 'status'];

  public projects = this.store.selectSignal(selectProjects);

  ngOnInit(): void {
    this.store.dispatch(ProjectActions.loadList());
  }


  newProject(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((project: ProjectDetailDto) => {
      if (project) {
        this.store.dispatch(ProjectActions.create({dto: project}));
      }
    });
  }

  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
}
