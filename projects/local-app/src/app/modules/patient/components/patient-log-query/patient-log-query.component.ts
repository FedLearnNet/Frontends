import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatProgressBar} from "@angular/material/progress-bar";
import {animate, style, transition, trigger} from "@angular/animations";
import {LogService} from "../../../logs/services/log-service";
import {MatDialog} from "@angular/material/dialog";
import {PatientQueryLogDto} from "../../../logs/dto/logs";
import {toSignal} from "@angular/core/rxjs-interop";
import {PatientDto} from "../../dto/patient";
import {LocalQueryDto} from "../../../logs/dto/query";
import {parseValue, prettifyOperator} from "../../../logs/helper/query.helper";
import {QueryOperatorDTO, QueryOperatorTypes} from "@global-app/find-data/dto/query";
import {
  QueryLogDetailDialogComponent
} from "../../../query/components/query-log-detail-dialog/query-log-detail-dialog.component";
import {QueryOverviewCardComponent} from "@shared-lib/modules/query/query-overview-card/query-overview-card.component";

@Component({
  selector: 'app-patient-log-query',
  imports: [
    ErrorCardComponent,
    MatProgressBar,
    QueryOverviewCardComponent,
  ],
  templateUrl: './patient-log-query.component.html',
  styleUrl: './patient-log-query.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('rowIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(4px)'}),
        animate('140ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class PatientLogQueryComponent implements OnInit {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);

  patient = input.required<PatientDto>();

  items = signal<PatientQueryLogDto[]>([]);
  loading = signal<boolean>(true);
  totalCount = signal<number | undefined>(undefined);
  hasMore = signal<boolean>(false);

  queries = toSignal(this.logService.getQueryInfos());

  ngOnInit(): void {
    this.logService.getPatientQueryLog("",
      "",
      0,
      25,
      "",
      this.patient().id).subscribe(l => {
      this.loading.set(false);
      this.totalCount.set(l.totalCount);
      this.items.update(values => {
        return [...values, ...l.results];
      });
      if (l.totalCount > this.items().length) {
        this.hasMore.set(true);
      } else {
        this.hasMore.set(false);
      }
    })
  }

  get error() {
    return "";
  }

  public formatCondition(op: QueryOperatorDTO): string {
    const norm = op.operator as QueryOperatorTypes | string;
    if (norm === QueryOperatorTypes.EXISTS || norm === 'exists') {
      return prettifyOperator(norm);
    }
    return `${prettifyOperator(norm)} ${parseValue(op.value)}`.trim();
  }

  public fullQueryString(query: LocalQueryDto) {
    const groups = query.enhancedQuery ?? [];
    if (!groups.length) return '—';
    const groupStrings = groups.map(g => {
      const nodes = g.schemaNodes ?? [];
      const ops = (g.operator ?? []).map(this.formatCondition);

      if (!nodes.length) return ops.length ? `(${ops.join(' AND ')})` : '(—)';

      const perNode = nodes.map(n => {
        const body = ops.length ? ops.join(' AND ') : '—';
        return `${n.name}: ${body}`;
      });
      return '(' + perNode.join(' OR ') + ')';
    });

    return groupStrings.join(' AND ');
  }


  getQueryDetail(log: PatientQueryLogDto) {
    const queries = this.queries();
    if (!queries) {
      return;
    }
    return queries.find(q => q.globalQueryId === log?.queryId);
  }

  loadMore(): void {
  }

  openDetail(log: PatientQueryLogDto) {
    const queries = this.queries();
    if (!queries) {
      return;
    }
    const query = queries.find(q => q.globalQueryId === log?.queryId);

    this.dialog.open(QueryLogDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: query
    });
  }
}
