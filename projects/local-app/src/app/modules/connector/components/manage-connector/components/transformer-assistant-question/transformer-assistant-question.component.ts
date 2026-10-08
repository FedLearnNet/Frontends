import {Component, computed, effect, input, output, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MarkdownComponent, provideMarkdown} from 'ngx-markdown';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {HumanInTheLoopDTO, HumanInTheLoopType} from '@shared-lib/modules/app-execution/dto/chat';

const PATIENT_ID_AGENT = 'patientId';
const SAMPLE_VALUES = 2;
const SAMPLE_LENGTH = 28;

/** How much a column name looks like a patient id, e.g. patient_nbr, subject_id or MRN; 0 when not at all. */
function patientIdScore(column: string): number {
  const name = column.toLowerCase();
  const person = /(patient|subject|person|mrn|pid)/.test(name);
  const id = /(id|nbr|number|num|no)$/.test(name.replace(/[^a-z]/g, ''));
  return (person ? 2 : 0) + (person && id ? 1 : 0);
}

/** Shows a column question of the assistant, where the user selects one or more of the offered columns. */
@Component({
  selector: 'app-transformer-assistant-question',
  standalone: true,
  imports: [MatIcon, TranslatePipe, MarkdownComponent, BtnComponent],
  providers: [provideMarkdown()],
  templateUrl: './transformer-assistant-question.component.html',
  styleUrl: './transformer-assistant-question.component.scss',
})
export class TransformerAssistantQuestionComponent {
  question = input.required<HumanInTheLoopDTO>();
  /** Who asks, e.g. patientId for the patient id column at the start. */
  agent = input<string | null>(null);
  sampleRows = input<Record<string, unknown>[]>([]);
  answered = output<string[]>();

  readonly filter = signal('');
  readonly selected = signal<string[]>([]);

  readonly multiple = computed(() => this.question().type === HumanInTheLoopType.SELECT_COLUMNS);
  readonly columns = computed(() => {
    const filter = this.filter().trim().toLowerCase();
    const options = this.question().options ?? [];
    return filter ? options.filter(column => column.toLowerCase().includes(filter)) : options;
  });

  /** The column that most likely holds the patient id, offered pre-selected. */
  readonly suggestion = computed(() => {
    if (this.agent() !== PATIENT_ID_AGENT) {
      return null;
    }
    const ranked = (this.question().options ?? [])
      .map(column => ({column, score: patientIdScore(column)}))
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.column ?? null;
  });

  constructor() {
    // A new question starts with the suggestion, if there is one, and without a filter
    effect(() => {
      this.question();
      const suggestion = this.suggestion();
      this.selected.set(suggestion ? [suggestion] : []);
      this.filter.set('');
    });
  }

  /** A few distinct values of the column, e.g. "8222157, 58471101". */
  samples(column: string): string {
    const values: string[] = [];
    for (const row of this.sampleRows()) {
      const value = row?.[column];
      const text = value === null || value === undefined ? '' : String(value).trim();
      if (text && !values.includes(text)) {
        values.push(text);
      }
      if (values.length === SAMPLE_VALUES) {
        break;
      }
    }
    const joined = values.join(', ');
    return joined.length > SAMPLE_LENGTH ? joined.slice(0, SAMPLE_LENGTH) + '…' : joined;
  }

  isSelected(column: string): boolean {
    return this.selected().includes(column);
  }

  toggle(column: string): void {
    if (!this.multiple()) {
      this.selected.set([column]);
    } else if (this.isSelected(column)) {
      this.selected.update(selected => selected.filter(candidate => candidate !== column));
    } else {
      this.selected.update(selected => [...selected, column]);
    }
  }

  confirm(): void {
    this.answered.emit(this.selected());
  }
}
