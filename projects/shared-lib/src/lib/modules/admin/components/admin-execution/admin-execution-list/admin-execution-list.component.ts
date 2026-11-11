import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {MatPaginatorComponent} from '@shared-lib/components/mat-paginator/mat-paginator.component';
import {runStatusToBadgeStatus} from '@shared-lib/utils/badge-status.helper';
import {
  ExecutionLocation,
  ExecutionMode,
  ExecutionPurpose
} from '@shared-lib/modules/app-execution/dto/execution-run';
import {RunStatusTypes} from '../../../../../../../../global-app/src/app/modules/tool-development/dto/test-run';
import {ExecutionAdminService} from '../../../services/execution-admin.service';
import {ExecutionRunFilter, ExecutionRunSummaryDTO} from '../../../dto/execution-admin';

@Component({
  selector: 'lib-admin-execution-list',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    HeaderComponent,
    PageWrapperComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    BadgeComponent,
    MatPaginatorComponent,
  ],
  templateUrl: './admin-execution-list.component.html',
  styleUrl: '../admin-execution.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminExecutionListComponent {
  private readonly service = inject(ExecutionAdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly statuses = Object.values(RunStatusTypes);
  readonly purposes = Object.values(ExecutionPurpose);
  readonly modes = Object.values(ExecutionMode);
  readonly locations = Object.values(ExecutionLocation);

  readonly columns = ['id', 'name', 'purpose', 'mode', 'location', 'status', 'owner', 'steps', 'attempts',
    'created', 'started', 'duration', 'failure'];

  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  readonly filter = signal<ExecutionRunFilter>({});

  readonly runs = rxResource({
    params: () => ({page: this.pageIndex(), pageSize: this.pageSize(), filter: this.filter()}),
    stream: ({params}) => this.service.listRuns(params.page, params.pageSize, params.filter),
  });

  readonly rows = computed(() => this.runs.value()?.results ?? []);
  readonly total = computed(() => this.runs.value()?.totalCount ?? 0);

  setFilter(key: keyof ExecutionRunFilter, value: string | null): void {
    this.filter.update(filter => ({...filter, [key]: value}));
    this.pageIndex.set(0);
  }

  open(run: ExecutionRunSummaryDTO): void {
    this.router.navigate([run.id], {relativeTo: this.route});
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
