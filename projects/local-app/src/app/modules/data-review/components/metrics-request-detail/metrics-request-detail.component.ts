import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatStepperModule} from '@angular/material/stepper';
import {TranslatePipe} from '@ngx-translate/core';
import {
  CloseableDialogTitleComponent
} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {InfoGridComponent} from '@shared-lib/components/info-grid/info-grid.component';
import {InfoItemComponent} from '@shared-lib/components/info-item/info-item.component';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {FederatedLearningRequestStatus} from '@local-app/data-review/dto/federated-learning-request';
import {RequestRunMetricsDto} from '@local-app/data-review/dto/request-run-metrics';
import {RunMetricsRequestService} from '@local-app/data-review/services/run-metrics-request.service';
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";

interface MetricsRequestDetailData {
  request: RequestRunMetricsDto;
}

@Component({
  selector: 'app-metrics-request-detail',
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatStepperModule,
    TranslatePipe,
    CloseableDialogTitleComponent,
    InfoGridComponent,
    InfoItemComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    BtnComponent,
    InfoCardComponent,
  ],
  templateUrl: './metrics-request-detail.component.html',
  styleUrl: './metrics-request-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsRequestDetailComponent {
  private readonly dialogRef = inject(MatDialogRef<MetricsRequestDetailComponent>);
  private readonly metricsRequestService = inject(RunMetricsRequestService);

  readonly data = inject<MetricsRequestDetailData>(MAT_DIALOG_DATA);

  readonly isSubmitting = signal(false);

  protected readonly FederatedLearningRequestStatus = FederatedLearningRequestStatus;

  getStatusBadgeType(status: FederatedLearningRequestStatus) {
    switch (status) {
      case FederatedLearningRequestStatus.APPROVED:
      case FederatedLearningRequestStatus.COMPLETED:
        return 'SUCCESS';
      case FederatedLearningRequestStatus.REJECTED:
        return 'FAILED';
      case FederatedLearningRequestStatus.RUNNING:
        return 'RUNNING';
      default:
        return 'PENDING';
    }
  }

  onAccept(): void {
    this.updateStatus(FederatedLearningRequestStatus.APPROVED);
  }

  onReject(): void {
    this.updateStatus(FederatedLearningRequestStatus.REJECTED);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('720px', '80vh');
    }
  }

  private updateStatus(status: FederatedLearningRequestStatus): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.metricsRequestService.updateRequest(this.data.request, status).subscribe({
      next: (updated) => this.dialogRef.close(updated),
      error: () => this.isSubmitting.set(false),
    });
  }
}
