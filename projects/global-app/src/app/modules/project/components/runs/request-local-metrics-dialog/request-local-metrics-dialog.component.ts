import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {InfoGridComponent} from '@shared-lib/components/info-grid/info-grid.component';
import {InfoItemComponent} from '@shared-lib/components/info-item/info-item.component';
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

interface RequestLocalMetricsDialogData {
  projectId: number;
  experimentId: number;
}

@Component({
  selector: 'app-request-local-metrics-dialog',
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    MatDividerModule,
    CloseableDialogTitleComponent,
    BadgeComponent,
    InfoGridComponent,
    InfoItemComponent,
    InfoCardComponent,
    BtnComponent,
  ],
  templateUrl: './request-local-metrics-dialog.component.html',
  styleUrl: './request-local-metrics-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestLocalMetricsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RequestLocalMetricsDialogComponent>);
  readonly data = inject<RequestLocalMetricsDialogData>(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('92vw', '88vh');
    }
  }
}
