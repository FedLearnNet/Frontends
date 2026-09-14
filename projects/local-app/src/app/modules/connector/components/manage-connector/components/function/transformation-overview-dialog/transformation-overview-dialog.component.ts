import {Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';

import {
  CloseableDialogTitleComponent
} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {ValueCardComponent} from '@shared-lib/components/value-card/value-card.component';
import {
  EmptyStateComponent
} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';

import {ConnectorTransformerDTO} from '../../../../../dto/connector';
import {FunctionsDetailDTO} from '../../../../../dto/function';
import {getTransformerOutputColumns} from '../../../../../helper/connector-config-helper';

type TransformerLike = ConnectorTransformerDTO | FunctionsDetailDTO;

export interface TransformationOverviewDialogData {
  /** The original source columns before any transformer runs. */
  sourceColumns: string[];
  /** Ordered transformation pipeline. */
  transformers: TransformerLike[];
}

/**
 * How a single column is treated at a single pipeline step.
 * The order of the union mirrors the visual severity of a change.
 */
export type ColumnTreatment =
  | 'ORIGIN'        // source column, exists from the start
  | 'PASSTHROUGH'   // exists but the step does not touch it
  | 'READ'          // consumed as input, value left unchanged
  | 'MODIFIED'      // overwritten by the step
  | 'CREATED'       // produced by the step for the first time
  | 'ABSENT';       // does not exist yet at this step

export interface OverviewStep {
  index: number;
  title: string;
  subtitle: string;
  icon: string;
  isSource: boolean;
}

export interface OverviewCell {
  treatment: ColumnTreatment;
}

export interface OverviewRow {
  column: string;
  createdAtStep: number | null; // null => original source column
  cells: OverviewCell[];
  touched: boolean;
}

interface TreatmentMeta {
  label: string;
  icon: string;
  className: string;
}

const TREATMENT_META: Record<ColumnTreatment, TreatmentMeta> = {
  ORIGIN: {label: 'Source column', icon: 'radio_button_unchecked', className: 'origin'},
  PASSTHROUGH: {label: 'Carried unchanged', icon: 'more_horiz', className: 'passthrough'},
  READ: {label: 'Read as input', icon: 'visibility', className: 'read'},
  MODIFIED: {label: 'Overwritten', icon: 'edit', className: 'modified'},
  CREATED: {label: 'Created', icon: 'auto_awesome', className: 'created'},
  ABSENT: {label: 'Not present yet', icon: '', className: 'absent'},
};

@Component({
  selector: 'app-transformation-overview-dialog',
  standalone: true,
  templateUrl: './transformation-overview-dialog.component.html',
  styleUrl: './transformation-overview-dialog.component.scss',
  imports: [
    MatDialogContent,
    MatIcon,
    MatTooltip,
    TranslatePipe,
    CloseableDialogTitleComponent,
    BtnComponent,
    BadgeComponent,
    InfoCardComponent,
    EmptyStateComponent,
    ValueCardComponent,
  ],
})
export class TransformationOverviewDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<TransformationOverviewDialogComponent>>(MatDialogRef);
  private readonly data = inject<TransformationOverviewDialogData>(MAT_DIALOG_DATA);

  readonly treatmentMeta = TREATMENT_META;

  /** Column currently highlighted so its flow can be traced across every step. */
  readonly focusedColumn = signal<string | null>(null);

  readonly steps = computed<OverviewStep[]>(() => this.buildSteps());
  readonly rows = computed<OverviewRow[]>(() => this.buildRows());

  /** Explicit grid definition: sticky column header + one track per pipeline step. */
  readonly gridTemplateColumns = computed(
    () => `var(--row-head-width) repeat(${this.steps().length}, var(--col-width))`
  );

  readonly legendEntries: ColumnTreatment[] = ['ORIGIN', 'READ', 'MODIFIED', 'CREATED', 'PASSTHROUGH'];

  readonly summary = computed(() => {
    const rows = this.rows();
    const steps = this.steps();
    const created = rows.filter(row => row.createdAtStep !== null).length;
    const modified = rows.filter(row => row.cells.some(cell => cell.treatment === 'MODIFIED')).length;
    const untouched = rows.filter(row => !row.touched).length;
    return {
      transformerCount: Math.max(steps.length - 1, 0),
      columnCount: rows.length,
      created,
      modified,
      untouched,
    };
  });

  meta(treatment: ColumnTreatment): TreatmentMeta {
    return TREATMENT_META[treatment];
  }

  toggleFocus(column: string): void {
    this.focusedColumn.update(current => (current === column ? null : column));
  }

  isDimmed(column: string): boolean {
    const focused = this.focusedColumn();
    return focused !== null && focused !== column;
  }

  close(): void {
    this.dialogRef.close();
  }

  private buildSteps(): OverviewStep[] {
    const steps: OverviewStep[] = [{
      index: 0,
      title: 'Source',
      subtitle: `${this.sourceColumns().length} column(s)`,
      icon: 'table_chart',
      isSource: true,
    }];

    this.transformers().forEach((transformer, i) => {
      steps.push({
        index: i + 1,
        title: this.transformerTitle(transformer, i),
        subtitle: this.transformerSubtitle(transformer),
        icon: 'bolt',
        isSource: false,
      });
    });

    return steps;
  }

  private buildRows(): OverviewRow[] {
    const transformers = this.transformers();
    const stepCount = transformers.length + 1;

    // Preserve first-seen order: source columns first, then columns as they are created.
    const orderedColumns: string[] = [...this.sourceColumns()];
    const known = new Set(orderedColumns);
    const createdAt = new Map<string, number>();

    const inputsPerStep: Set<string>[] = [];
    const outputsPerStep: Set<string>[] = [];

    transformers.forEach((transformer, i) => {
      const outputs = new Set(
        getTransformerOutputColumns(transformer).filter(column => this.isColumnReference(column))
      );
      const inputs = new Set(
        this.transformerInputColumns(transformer).filter(column => this.isColumnReference(column))
      );
      outputsPerStep.push(outputs);
      inputsPerStep.push(inputs);

      outputs.forEach(column => {
        if (!known.has(column)) {
          known.add(column);
          createdAt.set(column, i + 1);
          orderedColumns.push(column);
        }
      });
      // Referencing an unknown input column still surfaces it in the overview.
      inputs.forEach(column => {
        if (!known.has(column)) {
          known.add(column);
          createdAt.set(column, i + 1);
          orderedColumns.push(column);
        }
      });
    });

    return orderedColumns.map(column => {
      const createdAtStep = createdAt.get(column) ?? null;
      const cells: OverviewCell[] = [];
      let touched = false;

      for (let step = 0; step < stepCount; step++) {
        if (step === 0) {
          cells.push({treatment: createdAtStep === null ? 'ORIGIN' : 'ABSENT'});
          continue;
        }

        const transformerIndex = step - 1;
        const notYetExisting = createdAtStep !== null && step < createdAtStep;
        if (notYetExisting) {
          cells.push({treatment: 'ABSENT'});
          continue;
        }

        const outputs = outputsPerStep[transformerIndex];
        const inputs = inputsPerStep[transformerIndex];

        let treatment: ColumnTreatment;
        if (createdAtStep === step && outputs.has(column)) {
          treatment = 'CREATED';
          touched = true;
        } else if (outputs.has(column)) {
          treatment = 'MODIFIED';
          touched = true;
        } else if (inputs.has(column)) {
          treatment = 'READ';
          touched = true;
        } else {
          treatment = 'PASSTHROUGH';
        }
        cells.push({treatment});
      }

      return {column, createdAtStep, cells, touched};
    });
  }

  private transformerInputColumns(transformer: TransformerLike): string[] {
    const columns: string[] = [];
    if (transformer.column) {
      columns.push(...transformer.column.split(',').map(column => column.trim()));
    }
    if (transformer.inputMapping) {
      columns.push(...Object.values(transformer.inputMapping).map(value => String(value).trim()));
    }
    return columns.filter(Boolean);
  }

  /**
   * Placeholders such as "[VALUE]", "[VALUE]?" or "[VALUE]null" are literal value inputs,
   * not references to a source column, so they must not appear as rows in the column-flow
   * overview. Any token starting with a "[VALUE]" (or "[...]") placeholder is ignored.
   */
  private isColumnReference(column: string): boolean {
    if (!column) {
      return false;
    }
    const normalized = column.trim().toUpperCase();
    return !normalized.startsWith('[VALUE]') && !/^\[[^\]]*]/.test(normalized);
  }

  private transformerTitle(transformer: TransformerLike, index: number): string {
    return transformer.methodName || transformer.moduleName || `Transformer ${index + 1}`;
  }

  private transformerSubtitle(transformer: TransformerLike): string {
    const outputs = getTransformerOutputColumns(transformer);
    const mode = transformer.mode ? String(transformer.mode) : '';
    if (outputs.length) {
      return `${mode ? mode + ' · ' : ''}${outputs.length} output(s)`;
    }
    return mode || 'Transformer';
  }

  private sourceColumns(): string[] {
    return (this.data.sourceColumns ?? []).filter(column => this.isColumnReference(column));
  }

  private transformers(): TransformerLike[] {
    return this.data.transformers ?? [];
  }
}
