import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SchemaRootNodeDto } from '@local-app/cohort/dto/schema';
import { PatientDto } from '../../dto/patient';
import { PageWrapperComponent } from '@shared-lib/components/page-wrapper/page-wrapper.component';
import { PatientEditorComponent } from '../patient-editor/patient-editor.component';
import { HasPatientUnsavedChanges } from '../../guards/patient-unsaved-changes.guard';
import { TranslateService } from '@ngx-translate/core';

const COHORT_PATIENTS_TAB_FRAGMENT = 'Patients';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
  imports: [
    PageWrapperComponent,
    PatientEditorComponent,
  ],
})
export class PatientFormComponent implements OnInit, HasPatientUnsavedChanges {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  private readonly editor = viewChild(PatientEditorComponent);

  private readonly mode = toSignal(
    this.activatedRoute.data.pipe(map(d => d['mode'] as 'create' | 'edit')),
    {initialValue: 'create' as const},
  );

  private readonly loadedPatient = toSignal(
    this.activatedRoute.data.pipe(map(d => d['patient'] as PatientDto | undefined)),
    {initialValue: undefined},
  );

  readonly cohortId = toSignal(
    this.activatedRoute.parent!.data.pipe(
      map(d => (d['cohort']?.id ?? Number(this.activatedRoute.snapshot.paramMap.get('cohortId'))) as number),
    ),
    {initialValue: 0},
  );

  readonly schema = toSignal(
    this.activatedRoute.parent!.data.pipe(
      map(d => d['cohort']?.schemaRoot as SchemaRootNodeDto | undefined),
    ),
    {initialValue: undefined},
  );

  initialPatient = signal<PatientDto | undefined>(undefined);
  private discardChanges = false;

  ngOnInit(): void {
    const patientData = this.loadedPatient();
    if (patientData) {
      this.initialPatient.set(structuredClone(patientData));
      return;
    }

    const now = new Date();
    this.initialPatient.set({
      id: 0,
      version: 0,
      createdAt: now,
      updatedAt: now,
      cohortId: this.cohortId(),
      externalPatientId: '',
      dataEntries: [],
    });
  }

  hasUnsavedChanges(): boolean {
    if (this.discardChanges) {
      return false;
    }
    return this.editor()?.hasUnsavedChanges() ?? false;
  }

  isCreate(): boolean {
    return this.mode() === 'create';
  }

  onSaved(patient: PatientDto): void {
    if (this.isCreate()) {
      const newId = patient.id;
      if (newId) {
        void this.router.navigate(['patient', newId], {relativeTo: this.activatedRoute.parent});
      } else {
        this.navigateToCohortOverview();
      }
      return;
    }

    this.navigateToCohortOverview();
  }

  onCancelled(): void {
    const editor = this.editor();
    if (editor?.hasUnsavedChanges()) {
      const title = this.translate.instant('DIALOG.UNSAVED_PATIENT_CHANGES.TITLE');
      const message = this.translate.instant('DIALOG.UNSAVED_PATIENT_CHANGES.MESSAGE');
      if (!confirm(`${title}\n\n${message}`)) {
        return;
      }
    }

    this.discardChanges = true;
    this.navigateToCohortOverview(COHORT_PATIENTS_TAB_FRAGMENT);
  }

  private navigateToCohortOverview(fragment?: string): void {
    const parent = this.activatedRoute.parent;
    const extras = fragment ? {fragment} : {};

    if (parent) {
      void this.router.navigate(['.'], {relativeTo: parent, ...extras});
      return;
    }

    void this.router.navigate(['..'], {relativeTo: this.activatedRoute, ...extras});
  }
}
