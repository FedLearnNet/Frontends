import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subscription, take, tap} from 'rxjs';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {SchemaDetailComponent} from "@local-app/cohort/components/schema-detail/schema-detail.component";
import {CreateCohortDto} from "@local-app/cohort/models";
import {CohortService} from "@local-app/cohort/services/cohort.service";
import {MatDivider, MatDividerModule} from "@angular/material/divider";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {Router} from "@angular/router";
import {SchemaService} from "@local-app/cohort/services/schema.service";
import {SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {CohortCriteriaEditorComponent} from "@local-app/cohort/components/cohort-criteria-editor/cohort-criteria-editor.component";
import {
  CohortCriterionDto,
  EvidenceVariableRole,
  PublicationStatus,
  QueryOperatorTypes
} from "@local-app/cohort/models/cohort-criteria";

interface CohortCreateDialogData {
  schemaId: string;
}


@Component({
  selector: 'app-cohort-create-dialog',
  imports: [
    CloseableDialogTitleComponent,
    TranslatePipe,
    MatDialogContent,
    SchemaDetailComponent,
    MatDivider,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogActions,
    SkeletonLoaderComponent,
    CohortCriteriaEditorComponent
  ],
  templateUrl: './cohort-create-dialog.component.html',
  styleUrl: './cohort-create-dialog.component.scss'
})
export class CohortCreateDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef: MatDialogRef<SchemaDetailComponent> = inject(MatDialogRef<SchemaDetailComponent>);
  private readonly cohortService: CohortService = inject(CohortService);
  private readonly schemaService: SchemaService = inject(SchemaService);
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly router: Router = inject(Router);

  public readonly data = inject<CohortCreateDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(1000)]],
    citeAs: [''],
    status: [''],
    purpose: [''],
    copyright: [''],
    copyrightLabel: [''],
    criteria: this.fb.array<FormGroup>([]),
  });
  readonly currentStep = signal<1 | 2>(1);
  public schema = signal<SchemaRootNodeDto | undefined>(undefined);
  publicationStatuses = Object.values(PublicationStatus);

  readonly nameChecking = signal(false);
  readonly nameExists = signal(false);
  readonly nameCheckPending = signal(true);

  private nameCheckSub?: Subscription;

  private readonly formValid = toSignal(
    merge(
      this.form.statusChanges,
      this.form.valueChanges,
      this.form.controls.name.statusChanges,
    ).pipe(
      startWith(null),
      map(() => this.form.valid),
    ),
    {initialValue: this.form.valid},
  );

  readonly canCreate = computed(() =>
    this.formValid() &&
    !this.nameChecking() &&
    !this.nameExists() &&
    !this.nameCheckPending(),
  );

  readonly createDisabledHint = computed<string | null>(() => {
    if (this.canCreate()) {
      return null;
    }
    if (this.nameExists()) {
      return 'VALIDATION.COHORT_NAME_EXISTS';
    }
    return null;
  });

  get criteria(): FormArray<FormGroup> {
    return this.form.controls.criteria as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.setupNameValidation();
    this.schemaService.getGlobalSchemaByRoot(this.data.schemaId).subscribe(schema => {
      this.setSchema(schema);
      this.form.patchValue(
        {name: schema.name, description: schema.description},
        {emitEvent: false},
      );
      this.checkNameAvailability((schema.name ?? '').trim());
    });
  }

  private setupNameValidation(): void {
    this.form.controls.name.valueChanges.pipe(
      tap(() => {
        const trimmed = (this.form.controls.name.value ?? '').trim();
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

    this.form.controls.name.valueChanges.pipe(
      debounceTime(400),
      map(name => (name ?? '').trim()),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(name => this.checkNameAvailability(name));
  }

  private checkNameAvailability(name: string): void {
    this.nameCheckSub?.unsubscribe();
    if (!name) {
      this.nameChecking.set(false);
      this.nameExists.set(false);
      this.nameCheckPending.set(false);
      this.setNameExistsError(false);
      return;
    }
    this.nameChecking.set(true);
    this.nameCheckSub = this.cohortService.checkCohortNameHealth(name).pipe(
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
    const control = this.form.controls.name;
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

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  next() {
    this.currentStep.set(2 as const);
  }

  back() {
    this.currentStep.set(1 as const);
  }

  create(): void {
    if (!this.schema()) return;
    if (!this.canCreate()) return;
    const raw = this.form.getRawValue();
    const createDto: CreateCohortDto = {
      globalSchemaID: this.data.schemaId,
      name: raw.name,
      description: raw.description,
      citeAs: raw.citeAs || undefined,
      status: (raw.status || undefined) as PublicationStatus | undefined,
      purpose: raw.purpose || undefined,
      copyright: raw.copyright || undefined,
      copyrightLabel: raw.copyrightLabel || undefined,
      criteria: this.criteria.controls.map(control => this.toCriterionDto(control)),
    };
    this.cohortService.createCohort(createDto).subscribe((data) => {
        this.router.navigate(['/cohort', data.id]).then(_r => this.dialogRef.close());
      }
    );
  }

  private setSchema(schema: SchemaRootNodeDto) {
    this.schema.set({
      ...schema,
      childNodes: this.schemaService.sortSchemaNodes(schema.childNodes, 'name'),
    });
  }

  private toCriterionDto(group: FormGroup): CohortCriterionDto {
    const raw = group.getRawValue();
    const isValuelessOperator = raw.operator === QueryOperatorTypes.EXISTS || raw.operator === QueryOperatorTypes.NOT_EXISTS;
    return {
      id: raw.id ?? undefined,
      type: raw.type,
      variableRole: raw.variableRole ?? EvidenceVariableRole.POPULATION,
      description: raw.description || undefined,
      ontologyId: raw.ontologyId || undefined,
      dataTypeId: raw.dataTypeId || undefined,
      operator: raw.operator ? [{operator: raw.operator, value: isValuelessOperator ? '' : raw.value}] : [],
    };
  }
}
