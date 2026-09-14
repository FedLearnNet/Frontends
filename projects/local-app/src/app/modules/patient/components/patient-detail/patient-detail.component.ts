import {Component, computed, inject, input, OnInit, Signal, signal, viewChild} from '@angular/core';
import {PatientLogTraceabilityComponent} from "../patient-log-traceability/patient-log-traceability.component";
import {PatientLogQueryComponent} from "../patient-log-query/patient-log-query.component";
import {PatientLogTrainingComponent} from "../patient-log-training/patient-log-training.component";
import {PatientLogStatisticsComponent} from "../patient-log-statistics/patient-log-statistics.component";
import {PatientDataEntryDto, PatientDto} from "../../dto/patient";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {PatientDataComponent} from "../patient-data/patient-data.component";
import {SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {map} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {SkeletonLoaderComponent} from '@shared-lib/components/skeleton-loader/skeleton-loader.component';
import {
  DataExportConfigDialogComponent
} from "@shared-lib/modules/data-modeler/components/data-export-config-dialog/data-export-config-dialog.component";
import {TranslateService} from "@ngx-translate/core";
import {PatientEditorComponent} from "../patient-editor/patient-editor.component";
import {HasPatientUnsavedChanges} from "../../guards/patient-unsaved-changes.guard";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-patient-detail',
  imports: [
    PatientLogTraceabilityComponent,
    PatientLogQueryComponent,
    PatientLogTrainingComponent,
    PatientLogStatisticsComponent,
    ErrorCardComponent,
    PatientDataComponent,
    SkeletonLoaderComponent,
    PatientEditorComponent,
    HeaderComponent,
    BtnComponent,
  ],  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit, HasPatientUnsavedChanges {
  private readonly dialog = inject(MatDialog);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private readonly editor = viewChild(PatientEditorComponent);

  cohortId = input.required<string>();
  patientId = input.required<string>();

  loadedPatient: Signal<PatientDto> = toSignal(this.activatedRoute.data.pipe(map(d => d['patient'])));
  patient = signal<PatientDto>(this.loadedPatient());
  loading = signal<boolean>(false);
  isEditing = signal(false);

  schema: Signal<SchemaRootNodeDto | undefined> = toSignal(
    this.activatedRoute.parent!.data.pipe(
      map(data => data['cohort']?.schemaRoot as SchemaRootNodeDto | undefined),
    ),
    {initialValue: undefined}
  );

  sortedTopLevelNodes = computed(() => {
    const nodes = this.schema()?.childNodes;
    if (!nodes?.length) return [];
    return [...nodes].sort((a, b) => a.name.localeCompare(b.name));
  });

  pageTitle = computed(() => this.patient()?.externalPatientId ?? this.translate.instant('BUTTON.UPDATE_PATIENT'));

  ngOnInit(): void {
    const editParam = this.activatedRoute.snapshot.queryParamMap.get('edit');
    if (editParam === 'true') {
      this.isEditing.set(true);
    }
  }

  hasUnsavedChanges(): boolean {
    if (!this.isEditing()) return false;
    return this.editor()?.hasUnsavedChanges() ?? false;
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  onEditorSaved(updated: PatientDto): void {
    this.patient.set(updated);
    this.isEditing.set(false);
    this.clearEditQueryParam();
  }

  onEditorCancelled(): void {
    if (this.hasUnsavedChanges()) {
      const title = this.translate.instant('DIALOG.UNSAVED_PATIENT_CHANGES.TITLE');
      const message = this.translate.instant('DIALOG.UNSAVED_PATIENT_CHANGES.MESSAGE');
      if (!confirm(`${title}\n\n${message}`)) {
        return;
      }
    }
    this.isEditing.set(false);
    this.clearEditQueryParam();
  }

  private clearEditQueryParam(): void {
    void this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {edit: null},
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  exportCohort(): void {
    if (!this.patient()) {
      return;
    }
    this.dialog.open(DataExportConfigDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {
        patient: this.patient(),
      },
    });
  }

  onEntryCreated(entry: PatientDataEntryDto): void {
    this.patient.update(p => {
      if (!p) return p;
      const current = p.dataEntries ?? [];
      const exists = current.some(e => e.id === entry.id);
      return exists ? p : {...p, dataEntries: [...current, entry]};
    });
  }

  onEntryUpdated(entry: PatientDataEntryDto): void {
    this.patient.update(p => {
      if (!p) return p;
      const current = p.dataEntries ?? [];
      return {...p, dataEntries: current.map(e => e.id === entry.id ? entry : e)};
    });
  }

  onEntryDeleted(entryId: number): void {
    this.patient.update(p => {
      if (!p) return p;
      const current = p.dataEntries ?? [];
      return {...p, dataEntries: current.filter(e => e.id !== entryId)};
    });
  }
}
