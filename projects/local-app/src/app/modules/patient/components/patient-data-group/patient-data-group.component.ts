import {Component, computed, effect, inject, input, model, signal, output} from '@angular/core';
import {PatientDataEntryCreateDto, PatientDataEntryDto} from "../../dto/patient";
import {PatientDataElementComponent} from "../patient-data-element/patient-data-element.component";
import {PatientDataSparklineComponent} from "../patient-data-sparkline/patient-data-sparkline.component";
import {SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";
import {MatButtonModule} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {PatientDataFormFieldComponent} from "../patient-data-form-field/patient-data-form-field.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {CohortDataService} from "@local-app/cohort/services/cohort-data.service";
import {DynamicFormService} from "@local-app/cohort/services/dynamic-form.service";
import {parseValueForBackend, VISIT_TIMESTAMP_FORMAT_ISO} from "../../helper/patient-data-parser-helper";
import { TranslatePipe } from '@ngx-translate/core';
import { BtnComponent } from '@shared-lib/components/btn/btn.component';

@Component({
  selector: 'app-patient-data-group',
  imports: [
    PatientDataElementComponent,
    PatientDataSparklineComponent,
    MatButtonModule,
    MatIcon,
    PatientDataFormFieldComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    BtnComponent,
  ],
  templateUrl: './patient-data-group.component.html',
  styleUrl: './patient-data-group.component.scss'
})
export class PatientDataGroupComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly cds: CohortDataService = inject(CohortDataService);
  private readonly dfs: DynamicFormService = inject(DynamicFormService);

  cohortId = input.required<number>();
  patientId = input.required<number>();
  formMode = input<boolean>(false);
  autoOpenAdd = input<boolean>(false);
  editable = input<boolean>(false);
  singleValuePerNode = input<boolean>(false);

  items = model.required<PatientDataEntryDto[]>();
  schemaNode = input.required<SchemaNodeNestedDto>();
  showChart = input<boolean>(false);

  entryCreated = output<PatientDataEntryDto>();
  entryUpdated = output<PatientDataEntryDto>();
  entryDeleted = output<number>();

  initialCount = input<number>(10);
  step = input<number>(10);

  visibleCount = signal<number>(this.initialCount());
  adding = signal<boolean>(false);
  form = signal<FormGroup | null>(null);
  private nextTempId = -1;
  private autoOpenApplied = false;
  private addPanelDismissed = false;

  constructor() {
    effect(() => {
      const total = this.items()?.length ?? 0;
      const desired = this.visibleCount();
      const minStart = Math.min(this.initialCount(), total);
      if (desired > total) this.visibleCount.set(total);
      if (desired < minStart) this.visibleCount.set(minStart);
    });
    effect(() => {
      if (this.adding()) {
        const fg = this.dfs.getFormGroup([this.schemaNode()]);
        fg.addControl('visitId', this.fb.control<string>(''));
        fg.addControl('visitTimestamp', this.fb.control<string>(''));
        this.form.set(fg);
      } else {
        this.form.set(null);
      }
    });
    effect(() => {
      if (
        !this.autoOpenApplied
        &&         !this.addPanelDismissed
        && this.editable()
        && this.autoOpenAdd()
        && this.formMode()
        && (this.items()?.length ?? 0) === 0
      ) {
        this.autoOpenApplied = true;
        this.adding.set(true);
      }
    });
  }

  total = computed(() => this.items()?.length ?? 0);

  readonly canAddMore = computed(() =>
    this.editable() && (!this.singleValuePerNode() || this.total() === 0),
  );

  readonly renderedItems = computed(() => {
    const arr = this.sortedItems() ?? [];
    const n = Math.min(this.visibleCount(), arr.length);
    const start = Math.max(0, arr.length - n);
    return arr.slice(start);
  });

  renderedCount = computed(() => this.renderedItems().length);

  hasMore = computed(() => this.renderedCount() < this.total());

  readonly sortedItems = computed<PatientDataEntryDto[]>(() => {
    const items = this.items();
    return [...items].sort((a, b) => {
      const aTime = a.visitTimestamp
        ? Date.parse(a.visitTimestamp)
        : a.createdAt
          ? new Date(a.createdAt).getTime()
          : Number.POSITIVE_INFINITY;
      const bTime = b.visitTimestamp
        ? Date.parse(b.visitTimestamp)
        : b.createdAt
          ? new Date(b.createdAt).getTime()
          : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  });

  showMore = () => {
    this.visibleCount.update(v => Math.min(v + this.step(), this.total()));
  };

  openAdd = () => {
    if (!this.editable() || !this.canAddMore()) {
      return;
    }
    this.addPanelDismissed = false;
    this.adding.set(true);
  };
  cancelAdd = () => {
    this.adding.set(false);
    if (this.autoOpenAdd() && (this.items()?.length ?? 0) === 0) {
      this.addPanelDismissed = true;
    }
  };

  /** Returns schema node id when the open add panel has validation errors. */
  validateOpenPanel(): number | null {
    if (!this.adding()) {
      return null;
    }
    const fg = this.form();
    if (!fg) {
      return null;
    }
    fg.markAllAsTouched();
    return fg.valid ? null : this.schemaNode().id;
  }

  hasOpenAddPanel(): boolean {
    return this.adding();
  }

  onSubmit() {
    const fg = this.form();
    if (!fg) return;
    if (!fg.valid) {
      fg.markAllAsTouched();
      return;
    }

    if (this.singleValuePerNode() && this.total() > 0) {
      this.adding.set(false);
      return;
    }

    const nodeId = this.schemaNode().id;
    const value = parseValueForBackend(fg.value?.[nodeId], this.schemaNode().dataType.type);
    const visitId = fg.value?.['visitId'] ?? '';
    const visitTimestampLocal = fg.value?.['visitTimestamp'] as string | null;

    const iso = visitTimestampLocal ? this.toIsoZ(visitTimestampLocal) : null;

    const newEntry: PatientDataEntryCreateDto = {
      schemaNodeId: nodeId,
      value,
      visitId,
      visitTimestamp: iso ?? undefined,
      visitTimestampFormat: iso ? VISIT_TIMESTAMP_FORMAT_ISO : undefined,
    };

    this.createEntry(newEntry);

    this.adding.set(false);
  }

  onItemChange(entry: PatientDataEntryDto): void {
    this.updateEntry(entry)
  }

  onDelete(entry: PatientDataEntryDto): void {
    this.deleteEntry(entry.id)
  }

  private createEntry(newEntry: PatientDataEntryCreateDto) {
    if (this.formMode()) {
      const now = new Date();
      const draft: PatientDataEntryDto = {
        id: this.nextTempId--,
        schemaNodeId: newEntry.schemaNodeId,
        value: newEntry.value,
        visitId: newEntry.visitId,
        visitTimestamp: newEntry.visitTimestamp,
        visitTimestampFormat: newEntry.visitTimestampFormat,
        metaData: [],
        version: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.entryCreated.emit(draft);
      return;
    }

    this.cds
        .createPatientDataEntry(this.cohortId(), this.patientId(), newEntry)
        .subscribe(entry => {
          this.entryCreated.emit(entry);
        });
  }

  private deleteEntry(toDelete: number) {
    if (this.formMode()) {
      this.entryDeleted.emit(toDelete);
      return;
    }

    this.cds.deletePatientDataEntry(this.cohortId(), this.patientId(), toDelete).subscribe(() => {
      this.entryDeleted.emit(toDelete);
    });
  }

  private updateEntry(updateDataEntry: PatientDataEntryDto) {
    if (this.formMode()) {
      this.entryUpdated.emit(updateDataEntry);
      return;
    }

    this.cds.updatePatientDataEntry(this.cohortId(), this.patientId(), updateDataEntry).subscribe(e => {
      this.entryUpdated.emit(e);
    });
  }

  private toIsoZ(localDt: string): string {
    const d = new Date(localDt);
    return new Date(Date.UTC(
      d.getFullYear(), d.getMonth(), d.getDate(),
      d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()
    )).toISOString();
  }
}
