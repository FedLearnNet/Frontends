import {Component, computed, DestroyRef, effect, inject, input, model, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subscription, take, tap} from 'rxjs';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {HttpErrorResponse} from '@angular/common/http';
import {CohortDetailDto} from '@local-app/cohort/models/cohort';
import {isCohortDeleting} from '@local-app/cohort/models';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {BadgeColor, BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {
  CohortCriteriaEditorComponent
} from '@local-app/cohort/components/cohort-criteria-editor/cohort-criteria-editor.component';
import {
  CohortCriterionDto,
  EvidenceVariableRole,
  PublicationStatus,
  QueryOperatorTypes
} from '@local-app/cohort/models/cohort-criteria';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';

@Component({
  selector: 'app-cohort-detail',
  templateUrl: './cohort-detail.component.html',
  styleUrl: './cohort-detail.component.scss',
  imports: [
    ReactiveFormsModule,
    NgClass,
    TranslatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    PageWrapperComponent,
    BadgeComponent,
    TimeBadgeComponent,
    CohortCriteriaEditorComponent,
    BtnComponent
  ]
})
export class CohortDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cohortService = inject(CohortService);
  private readonly responsiveService = inject(ResponsiveService);

  cohort = model<CohortDetailDto>();
  isEditing = input(false);

  screenSize = toSignal(this.responsiveService.getScreenSize(), {initialValue: 'md'});
  readonly nameChecking = signal(false);
  readonly nameExists = signal(false);
  readonly nameCheckPending = signal(true);

  private nameCheckSub?: Subscription;

  publicationStatuses = Object.values(PublicationStatus);

  cohortDetailForm: FormGroup = this.formBuilder.nonNullable.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    citeAs: [''],
    status: [''],
    purpose: [''],
    copyright: [''],
    copyrightLabel: [''],
    criteria: this.formBuilder.array<FormGroup>([]),
  });

  private readonly formValid = toSignal(
    merge(
      this.cohortDetailForm.statusChanges,
      this.cohortDetailForm.valueChanges,
      this.cohortDetailForm.controls['name'].statusChanges,
    ).pipe(
      startWith(null),
      map(() => this.cohortDetailForm.valid),
    ),
    {initialValue: this.cohortDetailForm.valid},
  );

  readonly canSubmit = computed(() =>
    this.formValid() &&
    !this.nameChecking() &&
    !this.nameExists() &&
    !this.nameCheckPending() &&
    !isCohortDeleting(this.cohort()),
  );

  readonly updateDisabledHint = computed<string | null>(() => {
    if (this.canSubmit()) {
      return null;
    }
    if (this.nameExists()) {
      return 'VALIDATION.COHORT_NAME_EXISTS';
    }
    return null;
  });

  get criteria(): FormArray<FormGroup> {
    return this.cohortDetailForm.controls['criteria'] as FormArray<FormGroup>;
  }

  private readonly _patchEffect = effect(() => {
    const c = this.cohort();
    if (!c) return;
    this.criteria.clear();
    (c.criteria ?? []).forEach(criterion => this.criteria.push(this.createCriterionGroup(criterion)));
    this.cohortDetailForm.patchValue({
      id: c.id ?? '',
      name: c.name ?? '',
      description: c.description ?? '',
      citeAs: c.citeAs ?? '',
      status: c.status ?? '',
      purpose: c.purpose ?? '',
      copyright: c.copyright ?? '',
      copyrightLabel: c.copyrightLabel ?? '',
    }, {emitEvent: false});
    this.cohortDetailForm.markAsPristine();
    this.checkNameAvailability((c.name ?? '').trim(), c.id);
  });

  ngOnInit(): void {
    this.setupNameValidation();
  }

  private setupNameValidation(): void {
    this.cohortDetailForm.controls['name'].valueChanges.pipe(
      tap(() => {
        const trimmed = (this.cohortDetailForm.controls['name'].value ?? '').trim();
        if (trimmed) {
          this.nameCheckPending.set(true);
        } else {
          this.nameChecking.set(false);
          this.nameExists.set(false);
          this.nameCheckPending.set(false);
          this.setNameExistsError(false);
        }
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();

    this.cohortDetailForm.controls['name'].valueChanges.pipe(
      debounceTime(400),
      map(name => (name ?? '').trim()),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(name => this.checkNameAvailability(name));
  }

  private checkNameAvailability(name: string, cohortId?: number | string): void {
    this.nameCheckSub?.unsubscribe();
    const id = cohortId ?? this.cohortDetailForm.controls['id'].value;
    if (!name || id == null || id === '') {
      this.nameChecking.set(false);
      this.nameExists.set(false);
      this.nameCheckPending.set(false);
      this.setNameExistsError(false);
      return;
    }
    this.nameChecking.set(true);
    this.nameCheckSub = this.cohortService.checkCohortNameHealth(name, id).pipe(
      take(1),
      catchError(() => of({nameExists: false})),
    ).subscribe(({nameExists}) => {
      this.nameChecking.set(false);
      this.nameCheckPending.set(false);
      this.nameExists.set(nameExists);
      this.setNameExistsError(nameExists);
    });
  }

  private setNameExistsError(exists: boolean): void {
    const control = this.cohortDetailForm.controls['name'];
    const errors = {...(control.errors ?? {})};
    if (exists) {
      control.setErrors({...errors, nameExists: true}, {emitEvent: true});
      control.markAsTouched();
      control.markAsDirty();
      return;
    }
    delete errors['nameExists'];
    control.setErrors(Object.keys(errors).length ? errors : null, {emitEvent: true});
  }

  onUpdateCohort(): void {
    this.cohortDetailForm.markAllAsTouched();

    if (!this.canSubmit() || isCohortDeleting(this.cohort())) {
      return;
    }

    this.cohortService.updateCohort(this.getUpdatePayload()).subscribe({
      next: response => this.cohort.set(response),
      error: (err: unknown) => {
        const status = (err as HttpErrorResponse)?.status
          ?? (err as { cause?: HttpErrorResponse })?.cause?.status;
        if (status === 409) {
          this.nameExists.set(true);
          this.nameCheckPending.set(false);
          this.setNameExistsError(true);
        }
      },
    });
  }

  private getUpdatePayload(): CohortDetailDto {
    const raw = this.cohortDetailForm.getRawValue();
    return {
      ...this.cohort()!,
      ...raw,
      status: raw.status || undefined,
      criteria: this.criteria.controls.map(control => this.toCriterionDto(control)),
    };
  }

  statusBadgeColor(status: PublicationStatus | undefined): BadgeColor {
    switch (status) {
      case PublicationStatus.ACTIVE:
        return 'GREEN';
      case PublicationStatus.DRAFT:
        return 'BLUE';
      case PublicationStatus.RETIRED:
        return 'ORANGE';
      case PublicationStatus.UNKNOWN:
        return 'GRAY';
      default:
        return 'GRAY';
    }
  }

  private createCriterionGroup(criterion: CohortCriterionDto = {}): FormGroup {
    const operator = criterion.operator?.[0];
    return this.formBuilder.nonNullable.group({
      id: [criterion.id ?? null],
      type: [criterion.type ?? 'INCLUSION'],
      variableRole: [criterion.variableRole ?? EvidenceVariableRole.POPULATION],
      description: [criterion.description ?? ''],
      ontologySearch: [criterion.ontologyId ?? ''],
      ontologyId: [criterion.ontologyId ?? ''],
      dataTypeId: [criterion.dataTypeId ?? ''],
      operator: [operator?.operator ?? ''],
      value: [operator?.value ?? ''],
    });
  }

  private toCriterionDto(group: FormGroup): CohortCriterionDto {
    const raw = group.getRawValue();
    const isValuelessOperator = raw.operator === QueryOperatorTypes.EXISTS || raw.operator === QueryOperatorTypes.NOT_EXISTS;
    return {
      id: raw.id ?? undefined,
      type: raw.type,
      variableRole: raw.variableRole,
      description: raw.description || undefined,
      ontologyId: raw.ontologyId || undefined,
      dataTypeId: raw.dataTypeId || undefined,
      operator: raw.operator ? [{operator: raw.operator, value: isValuelessOperator ? '' : raw.value}] : [],
    };
  }

}
