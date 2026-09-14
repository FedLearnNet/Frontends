import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {TranslatePipe} from "@ngx-translate/core";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatPaginatorComponent} from "@shared-lib/components/mat-paginator/mat-paginator.component";
import {Store} from "@ngrx/store";
import {FederatedLearningProjectActions} from "../../store/federated-learning-project.actions";
import {selectItems, selectTotal} from "../../store/federated-learning-project.selectors";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrl: './training-list.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    RouterLink,
    MatTooltipModule,
    MatPaginatorComponent,
    TimeBadgeComponent,
    StatusBadgeComponent,
    HeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TrainingListComponent implements OnInit {
  private readonly store: Store = inject(Store);

  flRequests = this.store.selectSignal(selectItems);
  totalCount = this.store.selectSignal(selectTotal);
  displayedColumns: string[] = ['name', 'description', 'status', 'time'];


  ngOnInit(): void {
    this.store.dispatch(FederatedLearningProjectActions.loadList({
      page: 0,
      pageSize: 50
    }));
  }

  onPageChange(event: any) {
    this.store.dispatch(FederatedLearningProjectActions.loadList({
      page: event.pageIndex,
      pageSize: event.pageSize
    }));
  }

  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
}
