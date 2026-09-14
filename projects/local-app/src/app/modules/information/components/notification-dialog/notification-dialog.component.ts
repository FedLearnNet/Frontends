import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslatePipe} from '@ngx-translate/core';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BadgeColor, BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {NotificationActions} from '@local-app/information/store/notification.actions';
import {selectUnread} from '@local-app/information/store/notification.selectors';
import {NotificationDTO, NotificationType} from '@shared-lib/base/notifications';
import {
  NotificationDetailDialogComponent
} from '@local-app/information/components/notification-detail-dialog/notification-detail-dialog.component';

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.scss',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    BadgeComponent,
    BtnComponent,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDialogComponent {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly dialogRef: MatDialogRef<NotificationDialogComponent> = inject(MatDialogRef);

  readonly unread = this.store.selectSignal(selectUnread);

  openDetail(n: NotificationDTO): void {
    this.dialog.open(NotificationDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {notification: n},
    });
  }

  markAsRead(n: NotificationDTO): void {
    this.store.dispatch(NotificationActions.markAsRead({id: n.id}));
  }

  archive(n: NotificationDTO): void {
    this.store.dispatch(NotificationActions.archive({id: n.id}));
  }

  markAllAsRead(): void {
    for (const n of this.unread()) {
      this.store.dispatch(NotificationActions.markAsRead({id: n.id}));
    }
  }

  viewAll(): void {
    this.dialogRef.close();
    this.router.navigate(['/information']);
  }

  close(): void {
    this.dialogRef.close();
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
}
