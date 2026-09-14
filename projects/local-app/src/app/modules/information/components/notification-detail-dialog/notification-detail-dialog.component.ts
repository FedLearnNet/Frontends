import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslatePipe} from '@ngx-translate/core';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {BadgeComponent, BadgeColor} from '@shared-lib/components/badge/badge.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {NotificationActions} from '@local-app/information/store/notification.actions';
import {isUnread} from '@local-app/information/store/notification.selectors';
import {NotificationDTO, NotificationPriority, NotificationStatus, NotificationType} from '@shared-lib/base/notifications';

export interface NotificationDetailDialogData {
  notification: NotificationDTO;
}

@Component({
  selector: 'app-notification-detail-dialog',
  templateUrl: './notification-detail-dialog.component.html',
  styleUrl: './notification-detail-dialog.component.scss',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    BadgeComponent,
    BtnComponent,
    KvComponent,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDetailDialogComponent {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);
  private readonly dialogRef: MatDialogRef<NotificationDetailDialogComponent> = inject(MatDialogRef);
  readonly data: NotificationDetailDialogData = inject(MAT_DIALOG_DATA);

  readonly notification = this.data.notification;
  readonly unread = isUnread(this.notification.status);

  typeColor(type: NotificationType | undefined): BadgeColor {
    switch (type) {
      case NotificationType.SUCCESS: return 'GREEN';
      case NotificationType.WARNING: return 'ORANGE';
      case NotificationType.ERROR: return 'RED';
      case NotificationType.ACTION_REQUIRED: return 'ORANGE';
      case NotificationType.INFO:
      default: return 'BLUE';
    }
  }

  priorityColor(priority: NotificationPriority | undefined): BadgeColor {
    switch (priority) {
      case NotificationPriority.CRITICAL: return 'RED';
      case NotificationPriority.HIGH: return 'ORANGE';
      case NotificationPriority.LOW: return 'GRAY';
      case NotificationPriority.NORMAL:
      default: return 'BLUE';
    }
  }

  statusColor(status: NotificationStatus | undefined): BadgeColor {
    switch (status) {
      case NotificationStatus.READ: return 'GRAY';
      case NotificationStatus.ARCHIVED: return 'GRAY';
      case NotificationStatus.FAILED: return 'RED';
      case NotificationStatus.DELIVERED: return 'GREEN';
      case NotificationStatus.PENDING:
      default: return 'BLUE';
    }
  }

  markAsRead(): void {
    this.store.dispatch(NotificationActions.markAsRead({id: this.notification.id}));
  }

  archive(): void {
    this.store.dispatch(NotificationActions.archive({id: this.notification.id}));
    this.dialogRef.close();
  }

  delete(): void {
    this.store.dispatch(NotificationActions.delete({id: this.notification.id}));
    this.dialogRef.close();
  }

  openAction(): void {
    const url = this.notification.actionUrl;
    if (!url) return;
    this.markAsRead();
    this.dialogRef.close();
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener');
    } else {
      this.router.navigateByUrl(url);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
