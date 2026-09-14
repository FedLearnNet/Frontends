import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  WritableSignal
} from '@angular/core';
import {PatientDataEntryDto} from "../../dto/patient";
import {MatDivider} from "@angular/material/divider";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import { DatePipe, JsonPipe, LowerCasePipe } from "@angular/common";
import {MatChip, MatChipSet} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";
import {PatientDataFormFieldComponent} from "../patient-data-form-field/patient-data-form-field.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DynamicFormService} from "@local-app/cohort/services/dynamic-form.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { TranslatePipe } from '@ngx-translate/core';
import {VISIT_TIMESTAMP_FORMAT_ISO} from "../../helper/patient-data-parser-helper";

@Component({
  selector: 'app-patient-data-element',
  imports: [
    MatDivider,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatIconButton,
    DatePipe,
    MatChipSet,
    MatChip,
    JsonPipe,
    PatientDataFormFieldComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    TranslatePipe,
    LowerCasePipe,
  ],
  templateUrl: './patient-data-element.component.html',
  styleUrl: './patient-data-element.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDataElementComponent implements OnInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly dfs: DynamicFormService = inject(DynamicFormService);

  item = model.required<PatientDataEntryDto>();
  schemaNode = input.required<SchemaNodeNestedDto>();
  editable = input<boolean>(false);
  expanded = signal(false);

  deleteElement = output<boolean>();

  itemPreview: WritableSignal<PatientDataEntryDto | undefined> = signal<PatientDataEntryDto | undefined>(undefined);

  valuePreview = computed(() => {
    const v = this.item().value;
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string') return v.length > 120 ? v.slice(0, 117) + '…' : v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return `Array(${v.length})`;
    return 'Object';
  });

  isObject = computed(() => {
    const v = this.item().value;
    return v && typeof v === 'object' && !Array.isArray(v);
  });

  metaPreview = computed(() => {
    const meta = this.item().metaData ?? [];
    return {items: meta.slice(0, 4), more: Math.max(meta.length - 4, 0)};
  });

  readonly canSubmit = computed(() => this.form.valid);

  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.itemPreview.set(this.item());
    if (!this.editable()) {
      return;
    }

    this.form = this.dfs.getFormGroup([this.schemaNode()])
    this.form.addControl(
      'visitId',
      this.fb.control<string>('')
    );
    this.form.addControl(
      'visitTimestamp',
      this.fb.control<string>('')
    );
    this.form.patchValue(
      {
        [this.item().schemaNodeId]: this.item()?.value ?? undefined,
        visitId: this.item()?.visitId ?? '',
        visitTimestamp: this.fromIsoZ(this.item()?.visitTimestamp)
      },
      {emitEvent: false}
    );
  }

  onFormChanged() {
    this.recomputePreviewFromForm();
  }

  onSubmit() {
    if (!this.form.valid) return;
    this.recomputePreviewFromForm();
    const data = {
      ...this.item(),
      value: this.itemPreview()?.value,
      visitId: this.itemPreview()?.visitId,
      visitTimestamp: this.itemPreview()?.visitTimestamp,
      visitTimestampFormat: this.itemPreview()?.visitTimestampFormat
    }

    this.item.set(data);
  }

  onDelete() {
    this.deleteElement.emit(true);
  }

  private recomputePreviewFromForm() {
    const current = this.itemPreview();
    if (!current) return;
    const formVal = this.form.value as { visitId?: string; visitTimestamp?: string };

    const val = this.form.value[this.item().schemaNodeId];
    const visitTimestamp = this.toIsoZ(formVal.visitTimestamp);
    this.itemPreview.set({
      ...current,
      value: val,
      visitId: formVal.visitId ?? '',
      visitTimestamp,
      version: this.item().version + 1,
      updatedAt: new Date(),
      visitTimestampFormat: visitTimestamp ? VISIT_TIMESTAMP_FORMAT_ISO : undefined,
    });
  }

  private toIsoZ(input: string | undefined): string | undefined {
    if (!input) return undefined;
    const d = new Date(input);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  private fromIsoZ(input: string | undefined): string | undefined {
    if (!input) return undefined;
    const d = new Date(input);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().slice(0, 16);
  }


}
