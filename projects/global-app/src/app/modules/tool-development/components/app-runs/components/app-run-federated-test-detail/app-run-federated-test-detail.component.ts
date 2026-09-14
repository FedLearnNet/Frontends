import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {runStatusToBadgeStatus} from '@shared-lib/utils/badge-status.helper';
import {Subject, takeUntil} from 'rxjs';
import {
  FederatedParticipantDTO,
  FederatedRoundMessageDTO,
  FederatedTestRunDTO
} from '../../../../dto/federated-test-run';
import {FederatedRunService} from '../../../../service/federated-run.service';
import {ControllerSocketService} from '../../../../service/testembed-socket.service';
import {
  AppRunFederatedTestDetailParticipantCardComponent
} from '../app-run-federated-test-detail-participant-card/app-run-federated-test-detail-participant-card.component';
import {AppService} from '../../../../service/app.service';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {MatDialog} from '@angular/material/dialog';
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from '@shared-lib/components/markdown-dialog/markdown-dialog.component';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {
  AppRunOutputComponent
} from "@shared-lib/modules/app-execution/components/app-run-output/app-run-output.component";
import {RunType} from "../../../../dto/socket";
import {ToolConfigDTO} from "@shared-lib/modules/app-execution/dto/config";

type MessageDirectionFilter = 'ALL' | 'SEND' | 'RECEIVE';

@Component({
  selector: 'app-app-run-federated-test-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    TranslatePipe,
    StatusBadgeComponent,
    AppRunFederatedTestDetailParticipantCardComponent,
    BadgeComponent,
    TimeBadgeComponent,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    InfoGridComponent,
    InfoItemComponent,
    AppRunOutputComponent
  ],
  templateUrl: './app-run-federated-test-detail.component.html',
  styleUrl: './app-run-federated-test-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRunFederatedTestDetailComponent implements OnInit, OnDestroy {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly appService: AppService = inject(AppService);
  private readonly federatedRunService: FederatedRunService = inject(FederatedRunService);
  private readonly socketService: ControllerSocketService = inject(ControllerSocketService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatSort)
  set sort(sort: MatSort | undefined) {
    if (!sort) return;
    this.messagesDataSource.sort = sort;
  }

  protected readonly run = signal<FederatedTestRunDTO | null>(null);
  protected readonly app = signal<AppDetailDto | null>(null);
  protected readonly participants = signal<FederatedParticipantDTO[]>([]);
  protected readonly roundMessages = signal<FederatedRoundMessageDTO[]>([]);
  protected readonly searchTerm = signal<string>('');
  protected readonly selectedRound = signal<number | null>(null);
  protected readonly expanded = signal<boolean>(false);

  protected readonly selectedDirection = signal<MessageDirectionFilter>('ALL');

  protected readonly messagesDataSource = new MatTableDataSource<FederatedRoundMessageDTO>([]);
  protected readonly messageColumns = ['round', 'direction', 'from', 'to', 'communicationId', 'preview', 'time'];

  protected readonly progress = computed(() => {
    const r = this.run();
    if (!r || !r.totalRounds || r.totalRounds <= 0) return 0;
    return Math.min(100, ((r.currentRound ?? 0) / r.totalRounds) * 100);
  });

  protected readonly filteredMessages = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const round = this.selectedRound();
    const direction = this.selectedDirection();

    return this.roundMessages().filter(message => {
      const matchesRound = round === null || message.round === round;
      const matchesDirection = direction === 'ALL' || message.direction === direction;
      const matchesSearch = !term || this.messageMatchesSearch(message, term);

      return matchesRound && matchesDirection && matchesSearch;
    });
  });

  private appId!: number;
  private runId!: number;

  constructor() {
    this.messagesDataSource.sortingDataAccessor = (message, property) => {
      switch (property) {
        case 'round':
          return message.round ?? Number.MAX_SAFE_INTEGER;
        case 'from':
          return message.fromParticipant ?? '';
        case 'to':
          return message.toParticipant ?? '';
        case 'communicationId':
          return message.communicationId ?? '';
        case 'time':
          return message.createdAt ? new Date(message.createdAt).getTime() : 0;
        default:
          return '';
      }
    };

    effect(() => {
      this.messagesDataSource.data = this.filteredMessages();
    });
  }

  readonly toolConfig = computed<ToolConfigDTO[] | undefined>(() => {
    return this.app()?.appConfig?.output;
  });

  ngOnInit() {
    this.appId = Number(this.route.parent?.snapshot.paramMap.get('app-id'));
    this.runId = Number(this.route.snapshot.paramMap.get('test-id'));

    this.appService.getMyApp(this.appId).subscribe(app => {
      this.app.set(app);
    });

    this.federatedRunService.getRun(this.appId, this.runId).subscribe(run => {
      this.run.set(run);

      if (run.participants?.length) {
        this.participants.set(run.participants);
      } else {
        this.federatedRunService.getParticipants(this.appId, this.runId).subscribe(list => {
          this.participants.set(list);
        });
      }

      if (run.roundMessages?.length) {
        this.roundMessages.set(run.roundMessages);
      } else {
        this.federatedRunService.getRoundMessages(this.appId, this.runId).subscribe(list => {
          this.roundMessages.set(list);
        });
      }
    });

    this.socketService.getFederatedRunUpdate$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (update.id !== this.runId) return;
        this.run.update(current => current ? {...current, ...update} : update);
      });

    this.socketService.getFederatedParticipantUpdate$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (update.federatedRunId !== this.runId) return;

        this.participants.update(list => {
          const idx = list.findIndex(p => p.participantId === update.participantId);

          if (idx === -1) {
            return [...list, update];
          }

          return list.map((p, i) => i === idx ? {...p, ...update} : p);
        });
      });

    this.socketService.getFederatedParticipantLogMessage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.runId !== this.runId) return;

        const participantId = message.process;

        this.participants.update(list => list.map(participant => {
          if (participant.participantId !== participantId) {
            return participant;
          }

          return {...participant};
        }));
      });

    this.socketService.getFederatedRoundMessage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        if (msg.federatedRunId !== this.runId) return;
        this.roundMessages.update(list => [...list, msg]);
      });
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  protected setRoundFilter(round: number | null): void {
    this.selectedRound.set(round);
  }

  protected setRoundFilterFromInput(event: Event): void {
    const value = event.target instanceof HTMLInputElement ? event.target.value : undefined;
    if (!value) return;
    const parsed = Number(value);

    if (!value || Number.isNaN(parsed) || parsed <= 0) {
      this.selectedRound.set(null);
      return;
    }

    this.selectedRound.set(parsed);
  }

  protected setDirectionFilter(direction: MessageDirectionFilter): void {
    this.selectedDirection.set(direction);
  }

  protected showPayloadDetail(message: FederatedRoundMessageDTO): void {
    if (message.payloadPreview == null) return;

    const markdown = '```json\n' + message.payloadPreview + '\n```';

    this.dialog.open(MarkdownDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        title: 'Payload',
        markdown,
        copyToClipboard: true
      } as MarkdownDialogData
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected downloadOutput(): void {
    this.federatedRunService.downloadOutput(this.appId, this.runId).subscribe(link => {
      link.download = link.download || `federated-run-${this.runId}-output.zip`;
      link.click();
    });
  }

  protected getOutputEntries(output: { [key: string]: any }): { key: string; value: string }[] {
    return Object.entries(output).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }));
  }

  protected back(): void {
    this.router.navigate(['/app', this.appId], {fragment: 'runs'});
  }

  private messageMatchesSearch(message: FederatedRoundMessageDTO, term: string): boolean {
    return [
      message.round,
      message.direction,
      message.fromParticipant,
      message.toParticipant,
      message.communicationId,
      message.payloadPreview,
      message.createdAt
    ]
      .filter(value => value !== null && value !== undefined)
      .some(value => String(value).toLowerCase().includes(term));
  }


  toggleExpanded() {
    this.expanded.update(e => !e);
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  protected readonly RunType = RunType;
}
