import {animate, style, transition, trigger} from '@angular/animations';
import {DecimalPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, input, output, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {
  IMPORT_PHASE_ORDER,
  ImportPhase,
  ImportTableDTO,
  ReuploadTableState,
  isImportFinished,
} from '../../../dto/import-progress';
import {ImportActivity} from '../../../dto/import-progress';

interface ImportStep {
  phase: ImportPhase;
  icon: string;
  title: string;
  detail: string;
  detailParams: Record<string, unknown>;
  /** Set only where the phase can say how far through it is; otherwise the bar says "still working". */
  percent?: number;
}

interface RailStep {
  phase: ImportPhase;
  state: 'done' | 'active' | 'pending';
}

const STEP_ICONS: Record<string, string> = {
  TRANSFER: 'cloud_upload',
  PARSING: 'table_chart',
  SAMPLING: 'preview',
  COMPARING: 'difference',
};


@Component({
  selector: 'app-import-activity',
  imports: [
    DecimalPipe,
    MatIcon,
    MatProgressBarModule,
    TranslatePipe,
    BadgeComponent,
    BtnComponent,
    InfoCardComponent,
  ],
  templateUrl: './import-activity.component.html',
  styleUrl: './import-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('step', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(0.75rem)'}),
        animate('240ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({opacity: 1, transform: 'none'})),
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({opacity: 0, transform: 'translateY(-0.75rem)'})),
      ]),
    ]),
    trigger('detail', [
      transition(':enter', [
        style({opacity: 0, height: 0}),
        animate('180ms ease-out', style({opacity: 1, height: '*'})),
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({opacity: 0, height: 0})),
      ]),
    ]),
  ],
})
export class ImportActivityComponent {

  readonly activity = input.required<ImportActivity>();
  readonly cancellable = input<boolean>(false);

  readonly cancelled = output<void>();
  readonly retried = output<void>();

  readonly openTable = signal<string | undefined>(undefined);

  readonly finished = computed(() => isImportFinished(this.activity().phase));
  readonly succeeded = computed(() => this.activity().phase === 'SUCCEEDED');
  readonly refused = computed(() => this.activity().phase === 'REFUSED');
  readonly failed = computed(() => this.activity().phase === 'FAILED');

  readonly tables = computed(() => this.activity().tables ?? []);

  readonly tablesRead = computed(() =>
    this.tables().filter(table => table.state === 'READ').length);

  readonly tablesSettled = computed(() =>
    this.tables().filter(table => table.state !== 'PENDING' && table.state !== 'READING').length);

  readonly totalRows = computed(() =>
    this.tables().reduce((sum, table) => sum + (table.rows ?? 0), 0));

  readonly missingColumns = computed(() => this.activity().refusal?.missingColumns ?? []);

  readonly addedColumns = computed(() => this.activity().refusal?.notFoundColumns ?? []);


  readonly refusedTables = computed(() => {
    const order: Record<ReuploadTableState, number> = {MISSING: 0, CHANGED: 1, ADDED: 2, MATCHED: 3};
    return [...(this.activity().refusal?.tables ?? [])]
      .sort((left, right) => order[left.state] - order[right.state]);
  });

  readonly rail = computed<RailStep[]>(() => {
    if (this.finished()) {
      return [];
    }
    const phases = IMPORT_PHASE_ORDER
      .filter(step => step !== 'COMPARING' || this.activity().connectorId !== undefined);
    const current = phases.indexOf(this.activity().phase);
    return phases.map((step, index) => ({
      phase: step,
      state: index < current ? 'done' : index === current ? 'active' : 'pending',
    }));
  });

  /** The phase on screen, or nothing once the import is over and the outcome takes its place. */
  readonly step = computed<ImportStep | undefined>(() => {
    const activity = this.activity();
    if (this.finished()) {
      return undefined;
    }
    switch (activity.phase) {
      case 'TRANSFER':
        return this.buildStep('TRANSFER', 'IMPORT.STEP.TRANSFER_DETAIL', {
          loaded: this.megabytes(activity.transferred),
          total: this.megabytes(activity.fileSize),
        }, activity.transferPercent);
      case 'PARSING':
        return this.tables().length
          ? this.buildStep('PARSING', 'IMPORT.STEP.PARSING_TABLES', {
            done: this.tablesSettled(),
            total: this.tables().length,
          })
          : this.buildStep('PARSING', 'IMPORT.STEP.PARSING_DETAIL', {
            size: this.megabytes(activity.fileSize),
          });
      case 'SAMPLING':
        return this.buildStep('SAMPLING', 'IMPORT.STEP.SAMPLING_DETAIL', {
          tables: this.tablesRead(),
        });
      case 'COMPARING':
        return this.buildStep('COMPARING', 'IMPORT.STEP.COMPARING_DETAIL', {});
      default:
        return undefined;
    }
  });

  readonly sizeLabel = computed(() => this.megabytes(this.activity().fileSize));

  toggleTable(table: ImportTableDTO): void {
    this.openTable.update(open => open === table.name ? undefined : table.name);
  }

  duration(table: ImportTableDTO): number {
    return Math.round(((table.durationMs ?? 0) / 1000) * 10) / 10;
  }

  private buildStep(
    phase: ImportPhase,
    detail: string,
    detailParams: Record<string, unknown>,
    percent?: number,
  ): ImportStep {
    return {
      phase,
      icon: STEP_ICONS[phase] ?? 'sync',
      title: `IMPORT.STEP.${phase}_TITLE`,
      detail,
      detailParams,
      percent,
    };
  }

  private megabytes(bytes: number | undefined): number {
    return Math.round(((bytes ?? 0) / (1024 * 1024)) * 10) / 10;
  }
}
