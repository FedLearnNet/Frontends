import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CohortDataService } from '@local-app/cohort/services/cohort-data.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiErrorSnackbarService } from '@shared-lib/services/api-error-snackbar.service';
import { PatientDataEntryCreateDto, PatientDataEntryDto, PatientDto } from '../../dto/patient';
import {
  normalizeVisitTimestampFormat,
  VISIT_TIMESTAMP_FORMAT_ISO,
} from '../../helper/patient-data-parser-helper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PatientDataComponent } from '../patient-data/patient-data.component';
import { PatientDataGroupComponent } from '../patient-data-group/patient-data-group.component';
import { SchemaRootNodeDto } from '@local-app/cohort/dto/schema';
import {
  EXTERNAL_PATIENT_ID_ANCHOR,
  PatientValidationIssue,
} from '../../models/patient-validation';
import { HeaderComponent } from '@shared-lib/components/header/header.component';
import { BtnComponent } from '@shared-lib/components/btn/btn.component';

export function buildPatientEditorSnapshot(patient: PatientDto, externalPatientId: string): string {
  return JSON.stringify({
    externalPatientId,
    dataEntries: patient.dataEntries ?? [],
  });
}

@Component({
  selector: 'app-patient-editor',
  templateUrl: './patient-editor.component.html',
  styleUrl: './patient-editor.component.scss',
  imports: [
    TranslatePipe,
    PatientDataComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    HeaderComponent,
    BtnComponent,
  ],
})
export class PatientEditorComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly cohortDataService = inject(CohortDataService);
  private readonly apiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly patientDataComponents = viewChildren(PatientDataComponent);
  private readonly patientDataGroups = viewChildren(PatientDataGroupComponent);
  private readonly patientIdSection = viewChild<ElementRef<HTMLElement>>('patientIdSection');

  mode = input.required<'create' | 'edit'>();
  initialPatient = input.required<PatientDto>();
  schema = input.required<SchemaRootNodeDto>();
  cohortId = input.required<number>();
  showHeader = input(true);
  stickyHeader = input(true);
  enableGoBack = input(false);
  headerTitle = input<string | undefined>(undefined);

  saved = output<PatientDto>();
  cancelled = output<void>();

  readonly externalPatientIdControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  draftPatient = signal<PatientDto | undefined>(undefined);
  submitting = signal(false);
  private snapshot = signal('');

  isCreate = computed(() => this.mode() === 'create');

  pageTitle = computed(() => {
    if (this.headerTitle()) {
      return this.headerTitle()!;
    }
    return this.isCreate()
      ? this.translate.instant('BUTTON.ADD_PATIENT')
      : this.translate.instant('BUTTON.UPDATE_PATIENT');
  });

  sortedTopLevelNodes = computed(() => {
    const nodes = this.schema()?.childNodes;
    if (!nodes?.length) return [];
    return [...nodes].sort((a, b) => a.name.localeCompare(b.name));
  });

  ngOnInit(): void {
    this.resetDraft(this.initialPatient());
  }

  hasUnsavedChanges(): boolean {
    const patient = this.draftPatient();
    if (!patient) return false;

    if (this.isCreate()) {
      return buildPatientEditorSnapshot(patient, this.externalPatientIdControl.value) !== this.snapshot();
    }

    return this.patientDataGroups().some(group => group.hasOpenAddPanel());
  }

  onEntryCreated(entry: PatientDataEntryDto): void {
    this.draftPatient.update(p => {
      if (!p) return p;
      const current = p.dataEntries ?? [];
      if (this.isCreate() && current.some(e => e.schemaNodeId === entry.schemaNodeId)) {
        return p;
      }
      return {...p, dataEntries: [...current, entry]};
    });
    this.syncSnapshotAfterLiveChange();
  }

  onEntryUpdated(entry: PatientDataEntryDto): void {
    this.draftPatient.update(p => {
      if (!p) return p;
      const current = p.dataEntries ?? [];
      return {...p, dataEntries: current.map(e => e.id === entry.id ? entry : e)};
    });
    this.syncSnapshotAfterLiveChange();
  }

  onEntryDeleted(entryId: number): void {
    this.draftPatient.update(p => {
      if (!p) return p;
      const current = p.dataEntries ?? [];
      return {...p, dataEntries: current.filter(e => e.id !== entryId)};
    });
    this.syncSnapshotAfterLiveChange();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    if (!this.validateBeforeSubmit()) {
      return;
    }

    const patient = this.draftPatient();
    if (!patient) return;

    this.submitting.set(true);

    if (!this.isCreate()) {
      this.submitting.set(false);
      this.saved.emit(patient);
      return;
    }

    const dataEntries = this.prepareDataEntriesForSubmit(patient.dataEntries ?? []);

    this.cohortDataService.createNewPatient({
      cohortId: this.cohortId(),
      externalPatientId: this.externalPatientIdControl.value.trim(),
      dataEntries,
    }).subscribe({
      next: (response) => {
        const created = this.mergeSavedPatient(patient, response);
        this.resetDraft(created);
        this.submitting.set(false);
        this.saved.emit(created);
      },
      error: (err) => {
        this.submitting.set(false);
        this.apiErrorSnackbarService.showSnackBar(err, err?.error);
      },
    });
  }

  resetDraft(patient: PatientDto): void {
    const clone = structuredClone(patient);
    this.draftPatient.set(clone);
    this.externalPatientIdControl.setValue(clone.externalPatientId);
    if (this.isCreate()) {
      this.externalPatientIdControl.enable();
    } else {
      this.externalPatientIdControl.disable();
    }
    this.snapshot.set(buildPatientEditorSnapshot(clone, clone.externalPatientId));
  }

  private prepareDataEntriesForSubmit(entries: PatientDataEntryDto[]): any[] {
    const seenSchemaNodeIds = new Set<number>();

    return entries
      .filter(entry => {
        if (seenSchemaNodeIds.has(entry.schemaNodeId)) {
          return false;
        }
        seenSchemaNodeIds.add(entry.schemaNodeId);
        return true;
      })
      .map(entry => this.prepareCreateEntryForSubmit(entry));
  }

  private syncSnapshotAfterLiveChange(): void {
    if (this.isCreate()) {
      return;
    }

    const patient = this.draftPatient();
    if (!patient) {
      return;
    }

    this.snapshot.set(buildPatientEditorSnapshot(patient, this.externalPatientIdControl.value));
  }

  private prepareCreateEntryForSubmit(entry: PatientDataEntryDto): PatientDataEntryCreateDto {
    const visitTimestamp = entry.visitTimestamp || undefined;
    const visitTimestampFormat = visitTimestamp
      ? normalizeVisitTimestampFormat(entry.visitTimestampFormat) ?? VISIT_TIMESTAMP_FORMAT_ISO
      : undefined;

    return {
      schemaNodeId: entry.schemaNodeId,
      value: entry.value ?? '',
      visitId: entry.visitId ?? '',
      ...(visitTimestamp ? {visitTimestamp, visitTimestampFormat} : {}),
    };
  }

  private mergeSavedPatient(draft: PatientDto, response: PatientDto | PatientDataEntryDto[] | undefined): PatientDto {
    if (!response) return draft;
    if (Array.isArray(response)) {
      return {...draft, dataEntries: response};
    }
    return {...draft, ...response, dataEntries: response.dataEntries ?? draft.dataEntries};
  }

  private validateBeforeSubmit(): boolean {
    const issues: PatientValidationIssue[] = [];

    this.externalPatientIdControl.markAsTouched();
    if (this.externalPatientIdControl.invalid) {
      issues.push({anchorId: EXTERNAL_PATIENT_ID_ANCHOR});
    }

    for (const group of this.patientDataGroups()) {
      const invalidNodeId = group.validateOpenPanel();
      if (invalidNodeId != null) {
        issues.push({anchorId: invalidNodeId});
      }
    }

    if (!issues.length) {
      return true;
    }

    this.revealValidationIssues(issues);
    return false;
  }

  private revealValidationIssues(issues: PatientValidationIssue[]): void {
    for (const issue of issues) {
      if (issue.anchorId === EXTERNAL_PATIENT_ID_ANCHOR) {
        continue;
      }
      for (const component of this.patientDataComponents()) {
        component.expandToSchemaNode(issue.anchorId);
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.scrollToFirstIssue(issues));
    });
  }

  private scrollToFirstIssue(issues: PatientValidationIssue[]): void {
    for (const issue of issues) {
      const target = issue.anchorId === EXTERNAL_PATIENT_ID_ANCHOR
        ? this.patientIdSection()?.nativeElement ?? null
        : this.findValidationTarget(issue.anchorId);

      if (target) {
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
        return;
      }
    }
  }

  private findValidationTarget(anchorId: number): HTMLElement | null {
    const root = this.host.nativeElement;

    return root.querySelector(`[data-patient-add-panel="${anchorId}"]`)
      ?? root.querySelector(`[data-patient-field-anchor="${anchorId}"]`);
  }
}
