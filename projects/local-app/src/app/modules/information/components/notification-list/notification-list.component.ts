import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TranslatePipe} from '@ngx-translate/core';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDialog} from '@angular/material/dialog';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {BadgeColor, BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {NotificationActions} from '@local-app/information/store/notification.actions';
import {isUnread, selectError, selectItems, selectLoading,} from '@local-app/information/store/notification.selectors';
import {NotificationDTO, NotificationStatus, NotificationType} from '@shared-lib/base/notifications';
import {
  NotificationDetailDialogComponent
} from '@local-app/information/components/notification-detail-dialog/notification-detail-dialog.component';
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

type StatusFilter = 'ALL' | 'UNREAD' | NotificationStatus;
type TypeFilter = 'ALL' | NotificationType;

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    HeaderComponent,
    PageWrapperComponent,
    BadgeComponent,
    BtnComponent,
    TranslatePipe,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  readonly notifications = this.store.selectSignal(selectItems);
  readonly loading = this.store.selectSignal(selectLoading);
  readonly error = this.store.selectSignal(selectError);

  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly typeFilter = signal<TypeFilter>('ALL');

  readonly statusOptions: StatusFilter[] = [
    'ALL',
    'UNREAD',
    NotificationStatus.READ,
    NotificationStatus.ARCHIVED,
    NotificationStatus.FAILED,
  ];
  readonly typeOptions: TypeFilter[] = [
    'ALL',
    NotificationType.INFO,
    NotificationType.SUCCESS,
    NotificationType.WARNING,
    NotificationType.ERROR,
    NotificationType.ACTION_REQUIRED,
  ];

  readonly filtered = computed<NotificationDTO[]>(() => {
    const s = this.statusFilter();
    const t = this.typeFilter();
    return this.notifications().filter(n => {
      const statusOk =
        s === 'ALL' ||
        (s === 'UNREAD' ? isUnread(n.status) : n.status === s);
      const typeOk = t === 'ALL' || (n.type ?? NotificationType.INFO) === t;
      return statusOk && typeOk;
    });
  });

  readonly displayedColumns = ['type', 'title', 'message', 'source', 'createdAt', 'status', 'actions'];

  ngOnInit(): void {
    this.store.dispatch(NotificationActions.loadUserInfo());
  }

  refresh(): void {
    this.store.dispatch(NotificationActions.loadUserInfo());
  }

  openDetail(n: NotificationDTO): void {
    this.dialog.open(NotificationDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {notification: n},
    });
  }

  markAsRead(n: NotificationDTO, event?: Event): void {
    event?.stopPropagation();
    this.store.dispatch(NotificationActions.markAsRead({id: n.id}));
  }

  archive(n: NotificationDTO, event?: Event): void {
    event?.stopPropagation();
    this.store.dispatch(NotificationActions.archive({id: n.id}));
  }

  delete(n: NotificationDTO, event?: Event): void {
    event?.stopPropagation();
    this.store.dispatch(NotificationActions.delete({id: n.id}));
  }

  isUnread(status: NotificationStatus | undefined): boolean {
    return isUnread(status);
  }

  typeColor(type: NotificationType | undefined): BadgeColor {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'GREEN';
      case NotificationType.WARNING:
        return 'ORANGE';
      case NotificationType.ERROR:
        return 'RED';
      case NotificationType.ACTION_REQUIRED:
        return 'ORANGE';
      case NotificationType.INFO:
      default:
        return 'BLUE';
    }
  }

  statusColor(status: NotificationStatus | undefined): BadgeColor {
    switch (status) {
      case NotificationStatus.READ:
        return 'GRAY';
      case NotificationStatus.ARCHIVED:
        return 'GRAY';
      case NotificationStatus.FAILED:
        return 'RED';
      case NotificationStatus.DELIVERED:
        return 'GREEN';
      case NotificationStatus.PENDING:
      default:
        return 'BLUE';
    }
  }
}
