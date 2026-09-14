import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDividerModule} from "@angular/material/divider";
import {TranslatePipe} from "@ngx-translate/core";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {
  AppRunFederatedTestConfigDialogComponent
} from "../app-run-federated-test-config-dialog/app-run-federated-test-config-dialog.component";
import {ControllerSocketService} from "../../../../service/testembed-socket.service";
import {
  FederatedParticipantConfigDTO,
  FederatedTestRunConfigDTO,
  FederatedTestRunCreateDTO,
  FLNetParticipantRole
} from "../../../../dto/federated-test-run";
import {
  FederatedClientTypeBadgeComponent
} from "@shared-lib/components/federated-client-type-badge/federated-client-type-badge.component";

interface AppRunFederatedTestStartData {
  app: AppDetailDto;
  datafiles: string[];
}

@Component({
  selector: 'app-app-run-federated-test-start',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    TranslatePipe,
    FederatedClientTypeBadgeComponent,

  ],
  templateUrl: './app-run-federated-test-start.component.html',
  styleUrl: './app-run-federated-test-start.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRunFederatedTestStartComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<AppRunFederatedTestStartComponent>);
  private readonly controllerSocketService: ControllerSocketService = inject(ControllerSocketService);
  protected readonly data = inject<AppRunFederatedTestStartData>(MAT_DIALOG_DATA);

  protected readonly participants = signal<FederatedParticipantConfigDTO[]>([
    {participantId: 'client-1', role: FLNetParticipantRole.CLIENT},
    {participantId: 'client-2', role: FLNetParticipantRole.CLIENT},
    {participantId: 'aggregator', role: FLNetParticipantRole.AGGREGATOR},
  ]);

  protected totalRounds?: number;
  protected pollInterval = 0.01;
  protected timeout = 5;
  protected maxPolls = 500;
  protected readonly Object = Object;

  protected addParticipant(): void {
    const ref = this.dialog.open(AppRunFederatedTestConfigDialogComponent, {
      width: 'min(1080px, 96vw)',
      maxWidth: '96vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {app: this.data.app, datafiles: this.data.datafiles, value: null},
    });
    ref.afterClosed().subscribe((result: FederatedParticipantConfigDTO | null | undefined) => {
      if (result) {
        this.participants.update(list => [...list, result]);
      }
    });
  }

  protected editParticipant(index: number): void {
    const ref = this.dialog.open(AppRunFederatedTestConfigDialogComponent, {
      width: 'min(1080px, 96vw)',
      maxWidth: '96vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {app: this.data.app, datafiles: this.data.datafiles, value: this.participants()[index]},
    });
    ref.afterClosed().subscribe((result: FederatedParticipantConfigDTO | null | undefined) => {
      if (result) {
        this.participants.update(list => list.map((p, i) => i === index ? result : p));
      }
    });
  }

  protected removeParticipant(index: number): void {
    this.participants.update(list => list.filter((_, i) => i !== index));
  }

  protected isValid(): boolean {
    const list = this.participants();
    if (list.length < 2) return false;
    return list.some(p => p.role === FLNetParticipantRole.AGGREGATOR) && list.some(p => p.role === FLNetParticipantRole.CLIENT);
  }

  protected onRunClick(): void {
    if (!this.isValid()) return;
    const create: FederatedTestRunCreateDTO = {
      federatedAppVersionId: this.data.app.latestVersionId,
      totalRounds: this.totalRounds,
      config: this.buildConfig(),
      participants: this.participants().map(p => ({
        participantId: p.participantId,
        role: p.role,
        //config: p.config,
        hyperParams: p.hyperParams,
        inputFilePaths: p.inputFilePaths,
      })),
    };
    this.controllerSocketService.runFederatedTest(create);
    this.dialogRef.close();
  }

  protected onCancelClick(): void {
    this.dialogRef.close();
  }

  private buildConfig(): FederatedTestRunConfigDTO {
    return {
      pollInterval: this.pollInterval || undefined,
      timeout: this.timeout || undefined,
      maxPolls: this.maxPolls || undefined,
      //useContainerizedController: this.useContainerizedController || false currently via .env in the tool itself
    };
  }

  protected readonly FLNetParticipantRole = FLNetParticipantRole;
}
