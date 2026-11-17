import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RunExecutionHelpComponent} from '@shared-lib/modules/app-execution/components/run-execution-help/run-execution-help.component';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
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
import {TestEngineService} from "../../../../service/test-engine.service";
import {TestEngineMode} from "../../../../dto/test-engine";
import {Store} from "@ngrx/store";
import * as TestEngineActions from "../../../../store/test-engine.actions";
import {MatExpansionModule} from '@angular/material/expansion';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';

interface AppRunFederatedTestStartData {
  app: AppDetailDto;
  datafiles: string[];
  builtImage?: boolean;
}

@Component({
  selector: 'app-app-run-federated-test-start',
  imports: [RunExecutionHelpComponent,
    MatExpansionModule, CloseableDialogTitleComponent, InfoCardComponent, BadgeComponent,
    CommonModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
  private readonly engineService = inject(TestEngineService);
  private readonly store = inject(Store);
  protected readonly starting = signal(false);
  protected aggregatorParticipantId = '';

  protected readonly participants = signal<FederatedParticipantConfigDTO[]>([
    {participantId: 'client-1', role: FLNetParticipantRole.CLIENT},
    {participantId: 'client-2', role: FLNetParticipantRole.CLIENT},
    {participantId: 'aggregator', role: FLNetParticipantRole.AGGREGATOR},
  ]);

  protected readonly roundParameter = this.data.app.appConfig.hyperparams?.find(p =>
    ['federated_rounds', 'total_rounds'].includes(p.variableName ?? p.name));
  protected totalRounds = this.data.builtImage ? Number(this.roundParameter?.default ?? 1) : undefined;
  protected pollInterval = this.data.builtImage ? 0.25 : 0.01;
  protected timeout = this.data.builtImage ? 600 : 5;
  protected maxPolls = this.data.builtImage ? 2400 : 500;
  protected readonly Object = Object;

  protected setClientCount(count: number): void {
    if (!Number.isInteger(count) || count < 1) return;
    const clients = this.clients().slice(0, count);
    const aggregators = this.participants().filter(p => p.role === FLNetParticipantRole.AGGREGATOR);
    for (let id = 1; clients.length < count; id++) {
      const participantId = `client-${id}`;
      if (![...clients, ...aggregators].some(p => p.participantId === participantId)) {
        clients.push({participantId, role: FLNetParticipantRole.CLIENT});
      }
    }
    this.participants.set([...clients, ...aggregators]);
    if (!clients.some(p => p.participantId === this.aggregatorParticipantId)) this.aggregatorParticipantId = '';
  }

  protected addParticipant(): void {
    const ref = this.dialog.open(AppRunFederatedTestConfigDialogComponent, {
      width: 'min(1080px, 96vw)',
      maxWidth: '96vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {app: this.data.app, datafiles: this.data.datafiles, value: null, builtImage: this.data.builtImage},
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
      data: {app: this.data.app, datafiles: this.data.datafiles, value: this.participants()[index], builtImage: this.data.builtImage},
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
    const list = this.effectiveParticipants();
    return !this.starting() && list.length >= 2 && list.every(p => !!p.participantId.trim()) &&
      (!this.data.builtImage || Number.isInteger(this.totalRounds) && this.totalRounds! > 0) &&
      new Set(list.map(p => p.participantId)).size === list.length &&
      list.filter(p => p.role === FLNetParticipantRole.AGGREGATOR).length === 1 &&
      list.some(p => p.role === FLNetParticipantRole.CLIENT) && this.clients()
        .every(p => (this.data.app.appConfig.input ?? []).every(input =>
          !input.required || !!p.inputFilePaths?.[input.variableName ?? input.name]?.trim()));
  }

  protected clients(): FederatedParticipantConfigDTO[] {
    return this.participants().filter(p => p.role === FLNetParticipantRole.CLIENT);
  }

  protected participantReady(p: FederatedParticipantConfigDTO): boolean {
    return p.role === FLNetParticipantRole.AGGREGATOR || (this.data.app.appConfig.input ?? []).every(input =>
      !input.required || !!p.inputFilePaths?.[input.variableName ?? input.name]?.trim());
  }

  protected readyClients(): number {
    return this.clients().filter(p => this.participantReady(p)).length;
  }

  protected validationHint(): string {
    if (this.readyClients() < this.clients().length) return 'Choose the required training data for each client to continue.';
    if (new Set(this.effectiveParticipants().map(p => p.participantId)).size !== this.effectiveParticipants().length)
      return 'Give each participant a unique name.';
    return 'Include at least one client and one aggregator, with a positive whole number of rounds.';
  }

  protected effectiveParticipants(): FederatedParticipantConfigDTO[] {
    return this.data.builtImage && this.aggregatorParticipantId
      ? this.clients().map(p => p.participantId === this.aggregatorParticipantId ? {...p, role: FLNetParticipantRole.AGGREGATOR} : p)
      : this.participants();
  }

  protected onRunClick(): void {
    if (!this.isValid()) return;
    const create: FederatedTestRunCreateDTO = {
      federatedAppVersionId: this.data.app.latestVersionId,
      totalRounds: this.totalRounds,
      aggregatorParticipantId: this.data.builtImage ? this.aggregatorParticipantId || undefined : undefined,
      config: this.buildConfig(),
      participants: this.effectiveParticipants().map(p => ({
        participantId: p.participantId,
        role: p.role,
        //config: p.config,
        hyperParams: this.totalRounds ? {...p.hyperParams,
          [this.roundParameter?.variableName ?? this.roundParameter?.name ?? 'federated_rounds']: this.totalRounds} : p.hyperParams,
        inputFilePaths: p.inputFilePaths,
      })),
    };
    if (this.data.builtImage) {
      this.starting.set(true);
      this.engineService.start(this.data.app.id, {mode: TestEngineMode.FEDERATED_RUN, federatedTestRun: create})
        .subscribe({next: engine => {
          this.store.dispatch(TestEngineActions.startTestEngineSuccess({engine}));
          this.dialogRef.close(true);
        }, error: () => this.starting.set(false)});
    } else {
      this.controllerSocketService.runFederatedTest(create);
      this.dialogRef.close();
    }
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
