import {Component, computed, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatChip, MatChipSet} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TranslatePipe} from "@ngx-translate/core";
import {participantOf, TestAttemptDTO, TestRunDTO} from "../../../../dto/test-run";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {RunStatusTypes} from "../../../../dto/test-run";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {MatDialog} from "@angular/material/dialog";
import {
  AppAppRunFederatedTestDetailParticipantDialogComponent
} from "../app-app-run-federated-test-detail-participant-dialog/app-app-run-federated-test-detail-participant-dialog.component";
import {
  FederatedClientTypeBadgeComponent
} from "@shared-lib/components/federated-client-type-badge/federated-client-type-badge.component";

@Component({
  selector: 'app-app-run-federated-test-detail-participant-card',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatChip,
    MatChipSet,
    MatIcon,
    StatusBadgeComponent,
    TranslatePipe,
    FederatedClientTypeBadgeComponent
  ],
  templateUrl: './app-run-federated-test-detail-participant-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-run-federated-test-detail-participant-card.component.scss',
})
export class AppRunFederatedTestDetailParticipantCardComponent {
  private readonly dialog = inject(MatDialog);

  // The attempt of the participant; what it is and how far it got is in its participant.
  participant = input.required<TestAttemptDTO>();
  run = input.required<TestRunDTO>();
  app = input.required<AppDetailDto>();

  participantBadge = computed(() => runStatusToBadgeStatus(this.participant().status ?? RunStatusTypes.PENDING));
  // Who the attempt stands for; how far it got is on the attempt itself.
  state = computed(() => participantOf(this.run(), this.participant()));


  showDetail(): void {
    const p = this.participant();
    const dialogRef = this.dialog.open(AppAppRunFederatedTestDetailParticipantDialogComponent, {
      width: '600px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: {
        app: this.app(),
        run: this.run(),
        participant: p
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result);
      }
    });
  }


}
