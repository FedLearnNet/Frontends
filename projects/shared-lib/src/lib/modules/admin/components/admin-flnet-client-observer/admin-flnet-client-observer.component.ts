import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal,} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {HintCardComponent} from '@shared-lib/components/hint-card/hint-card.component';
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from '@shared-lib/components/markdown-dialog/markdown-dialog.component';
import {StatusBadeType, StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {FLNetClientObserverService} from '@shared-lib/modules/admin/services/flnet-client-observer.service';
import {FLNetClientObserverEventDTO, FLNetClientObserverEventType} from '@shared-lib/modules/admin/dto/observer';

type FedDBClientTypeEnum =
  'EXISTING_QUERY' | 'LEARNING_QUERY' | 'DATA_STATISTICS' | 'START_LEARNING' |
  'UPDATE_LEARNING' | 'STOP_LEARNING' | 'CURRENT_LEARNINGS' | 'ERROR' | 'NO_RESPONSE';

const MESSAGE_TYPES: FedDBClientTypeEnum[] = [
  'EXISTING_QUERY', 'LEARNING_QUERY', 'DATA_STATISTICS', 'START_LEARNING',
  'UPDATE_LEARNING', 'STOP_LEARNING', 'CURRENT_LEARNINGS', 'ERROR', 'NO_RESPONSE',
];

@Component({
  selector: 'lib-admin-flnet-client-observer',
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltip,
    HeaderComponent,
    PageWrapperComponent,
    HintCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-flnet-client-observer.component.html',
  styleUrl: './admin-flnet-client-observer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFLNetClientObserverComponent implements OnInit {
  private readonly observerService = inject(FLNetClientObserverService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  readonly enabled = signal<boolean | null>(null);
  readonly clients = signal<string[]>([]);
  readonly events = signal<FLNetClientObserverEventDTO[]>([]);
  readonly streaming = signal(false);
  readonly loading = signal(false);

  readonly filterType = signal<FLNetClientObserverEventType | ''>('');
  readonly filterConnectionId = signal('');
  readonly filterMessageType = signal<FedDBClientTypeEnum | ''>('');

  readonly eventColumns = ['timestamp', 'connectionId', 'type', 'messageType', 'payload'];
  readonly allEventTypes: FLNetClientObserverEventType[] = [
    'CONNECTED', 'DISCONNECTED', 'MESSAGE_RECEIVED', 'MESSAGE_SENT',
  ];
  readonly allMessageTypes = MESSAGE_TYPES;

  readonly knownConnectionIds = computed(() => {
    const fromClients = this.clients();
    const fromEvents = this.events().map(e => e.connectionId);
    return [...new Set([...fromClients, ...fromEvents])].sort();
  });

  readonly filteredEvents = computed(() => {
    const type = this.filterType();
    const connId = this.filterConnectionId();
    const msgType = this.filterMessageType();

    return [...this.events()]
      .reverse()
      .filter(e => {
        if (type && e.type !== type) return false;
        if (connId && e.connectionId !== connId) return false;
        if (msgType && e.messageType !== msgType) return false;
        return true;
      });
  });

  readonly hasActiveFilter = computed(() =>
    !!this.filterType() || !!this.filterConnectionId() || !!this.filterMessageType()
  );

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.loading.set(true);
    this.observerService.isEnabled()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: enabled => {
          this.enabled.set(enabled);
          this.loading.set(false);
          if (enabled) this.refreshClients();
        },
        error: () => this.loading.set(false),
      });
  }

  refreshClients(): void {
    this.observerService.getConnectedClients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(clients => this.clients.set(clients));
  }

  removeAllClients(): void {
    this.observerService.removeAllClients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clients.set([]));
  }

  startStream(): void {
    if (this.streaming()) return;
    this.streaming.set(true);
    this.events.set([]);

    this.observerService.streamEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: event => {
          this.events.update(prev => [...prev, event]);
          if (event.type === 'CONNECTED' || event.type === 'DISCONNECTED') {
            this.refreshClients();
          }
        },
        error: () => this.streaming.set(false),
        complete: () => this.streaming.set(false),
      });
  }

  clearEvents(): void {
    this.events.set([]);
  }

  clearFilters(): void {
    this.filterType.set('');
    this.filterConnectionId.set('');
    this.filterMessageType.set('');
  }

  openPayload(event: FLNetClientObserverEventDTO): void {
    if (event.payload == null) return;
    const jsonString = JSON.stringify(event.payload, null, 2);
    const markdown = '```json\n' + jsonString + '\n```';
    this.dialog.open(MarkdownDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        title: `Payload — ${event.messageType ?? event.type} (${event.connectionId})`,
        markdown,
        copyToClipboard: true,
      } as MarkdownDialogData,
    });
  }

  eventTypeBadge(type: FLNetClientObserverEventType): StatusBadeType {
    switch (type) {
      case 'CONNECTED':
        return 'SUCCESS';
      case 'DISCONNECTED':
        return 'FAILED';
      case 'MESSAGE_RECEIVED':
        return 'INIT';
      case 'MESSAGE_SENT':
        return 'WARNING';
    }
  }

  payloadPreview(payload: unknown): string {
    if (payload == null) return '—';
    const str = JSON.stringify(payload);
    return str.length > 80 ? str.slice(0, 80) + '…' : str;
  }
}
