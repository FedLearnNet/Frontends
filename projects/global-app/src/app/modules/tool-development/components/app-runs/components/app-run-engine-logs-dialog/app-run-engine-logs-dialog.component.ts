import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSnackBar} from "@angular/material/snack-bar";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {
  ConsoleOutputComponent
} from "@shared-lib/modules/app-execution/components/console-output/console-output.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {TestEngineService} from "../../../../service/test-engine.service";
import {engineAttemptOf, testEngineModeLabels} from "../../../../dto/test-engine";
import {TestRunDTO} from "../../../../dto/test-run";
import {errorOf} from "@shared-lib/modules/app-execution/dto/execution-run";

export interface AppRunEngineLogsDialogData {
  appId: number;
  engine: TestRunDTO;
}

@Component({
  selector: 'app-app-run-engine-logs-dialog',
  imports: [
    MatDialogContent,
    MatIconButton,
    MatIcon,
    MatTooltip,
    StatusBadgeComponent,
    ConsoleOutputComponent,
    CloseableDialogTitleComponent,
  ],
  templateUrl: './app-run-engine-logs-dialog.component.html',
  styleUrl: './app-run-engine-logs-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRunEngineLogsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppRunEngineLogsDialogComponent>);
  private readonly engineService = inject(TestEngineService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<AppRunEngineLogsDialogData>(MAT_DIALOG_DATA);

  readonly logs = signal<string[] | undefined>(undefined);
  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  readonly text = computed(() => (this.logs() ?? []).join('\n'));
  readonly title = (this.data.engine.engineMode ? testEngineModeLabels[this.data.engine.engineMode] : 'Engine')
    + ' of v' + this.data.engine.federatedAppVersionName;
  readonly exitCode = engineAttemptOf(this.data.engine)?.exitCode;
  readonly error = errorOf(this.data.engine);

  ngOnInit(): void {
    this.engineService.logs(this.data.appId, this.data.engine.id).subscribe(logs => this.logs.set(logs));
  }

  copy(): void {
    navigator.clipboard.writeText(this.text()).then(() => this.snackBar.open('Output copied', undefined, {duration: 2000}));
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
