import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {DataTypeNodeDTO} from "@global-app/schema/dto/datatype";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {SchemaDetailDialog} from "@global-app/schema/model/schema";
import {catchError, debounceTime, distinctUntilChanged, map, of, switchMap} from "rxjs";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {startWith} from "rxjs/operators";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {OntologyCardComponent} from '../ontology-card/ontology-card.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DatatypeCardComponent} from '../datatype-card/datatype-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {SchemaNodeType} from "@global-app/schema/dto/schema";
import {toSignal} from "@angular/core/rxjs-interop";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {getSchemaName, isSchemaAttribute} from "@global-app/schema/utils/schema-utils";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

@Component({
  selector: 'app-detail-schema-card',
  templateUrl: './detail-schema-card.component.html',
  styleUrl: './detail-schema-card.component.scss',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInput,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    OntologyCardComponent,
    MatIcon,
    MatAutocompleteModule,
    DatatypeCardComponent,
    MatButtonModule,
    TranslatePipe,
    PageWrapperComponent,
    BtnComponent,
    BadgeComponent,
    CloseableDialogTitleComponent,
    EmptyStateComponent
  ]
})
export class DetailSchemaCardComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DetailSchemaCardComponent>);
  readonly data = inject<SchemaDetailDialog>(MAT_DIALOG_DATA);
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  readonly schemaService: SchemaService = inject(SchemaService);
  readonly ontologyService: OntologyService = inject(OntologyService);

  readonly ontologyCtrl = new FormControl<string>('', {nonNullable: true});
  readonly datatypeCtrl = new FormControl<string>('', {nonNullable: true});

  schemaTypes: SchemaNodeType[] = [SchemaNodeType.GROUP, SchemaNodeType.ATOMIC_ATTRIBUTE, SchemaNodeType.LIST_ATTRIBUTE];

  readonly dataTypes = signal<DataTypeNodeDTO[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly filteredOntologies = toSignal(
    this.ontologyCtrl.valueChanges.pipe(
      startWith(this.ontologyCtrl.value),
      debounceTime(250),
      distinctUntilChanged(),
      map(v => (v ?? '').toString().trim()),
      switchMap(search =>
        this.ontologyService.getAllFiltered(search, 0, 10).pipe(
          map(res => res?.results ?? []),
          catchError(() => of([] as OntologyNodeDTO[]))
        )
      )
    ),
    {initialValue: [] as OntologyNodeDTO[]}
  );

  private readonly datatypeSearch = toSignal(
    this.datatypeCtrl.valueChanges.pipe(
      startWith(this.datatypeCtrl.value),
      map(v => (v ?? '').toString().trim().toLowerCase())
    ),
    {initialValue: ''}
  );

  readonly filteredDatatypes = computed(() => {
    const q = this.datatypeSearch();
    const list = this.dataTypes();
    if (!q) return list;

    return list.filter(d =>
      (d.name ?? '').toLowerCase().includes(q) ||
      (d.id ?? '').toLowerCase().includes(q)
    );
  });

  readonly selectedOntology = computed(() => {
    const id = this.data.current?.ontologyId;
    if (!id) return undefined;
    if (id === this.data.current?.ontology?.id) {
      return this.data.current?.ontology;
    }
    return this.filteredOntologies().find(o => o.id === id);
  });

  readonly selectedDatatype = computed(() => {
    const id = this.data.current?.dataTypeId;
    if (!id) return undefined;
    if (id === this.data.current?.dataType?.id) {
      return this.data.current?.dataType;
    }
    return this.dataTypes().find(d => d.id === id);
  });

  private loadOntologyEffect = effect(() => {
    const ontologyId = this.data.current?.ontologyId;
    if (!ontologyId) {
      this.dataTypes.set([]);
      this.datatypeCtrl.setValue('', {emitEvent: false});
      return;
    }
    this.loadDatatypes(ontologyId);
  });

  ngOnInit(): void {
    if (this.data.current?.type === SchemaNodeType.ROOT) {
      this.schemaTypes = [SchemaNodeType.ROOT];
    }

    const existingOntologyId = this.data.current?.ontologyId;
    if (existingOntologyId) {
      this.ontologyCtrl.setValue(existingOntologyId, {emitEvent: false});
      this.loadDatatypes(existingOntologyId);
    }

    const existingDatatypeId = this.data.current?.dataTypeId;
    if (existingDatatypeId) {
      this.datatypeCtrl.setValue(existingDatatypeId, {emitEvent: false});
    }

  }


  isDisabled(): boolean {
    return false;
  }

  getDataType(): DataTypeNodeDTO | undefined {
    const id = this.data.current?.dataTypeId;
    if (id) {
      return this.dataTypes().find(d => d.id === id);
    }
    return undefined;

  }

  loadDatatypes(ontologyId?: string) {
    if (!ontologyId) {
      return;
    }
    this.loading.set(true);
    this.dataTypeService.getAll(0, 100, ontologyId).subscribe(datatypes => {
      const list = datatypes?.results ?? [];
      this.dataTypes.set(list);
      const existing = this.data.current?.dataTypeId;
      if (existing && list.some(d => d.id === existing)) {
        this.datatypeCtrl.setValue(existing, {emitEvent: false});
        this.loading.set(false);
      } else if (existing) {
        this.dataTypeService.getById(existing).subscribe({
          next: dataType => {
            this.dataTypes.set([...this.dataTypes(), dataType]);
            this.datatypeCtrl.setValue(existing, {emitEvent: false});
            this.loading.set(false);
          },
          error: err => {
            this.error.set(err?.message ?? 'Error loading selected datatype.');
            this.loading.set(false);
          }
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  addOntology(): void {
    const id = this.ontologyCtrl.value?.trim();
    if (!id) return;

    this.data.current!.ontologyId = id;
    this.data.current!.dataTypeId = undefined;

    this.datatypeCtrl.setValue('', {emitEvent: false});
    this.loadDatatypes(id);
  }

  addDatatype(): void {
    const id = this.datatypeCtrl.value?.trim();
    if (!id) return;
    this.data.current!.dataTypeId = id;
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  save(): void {
    const schema = this.data.current!;
    if (!schema.id && this.data.parent?.id) {
      schema.parentId = this.data.parent.id;
    }
    this.dialogRef.close(schema);
  }

  protected readonly isSchemaAttribute = isSchemaAttribute;
  protected readonly getSchemaName = getSchemaName;
  protected readonly JSON = JSON;
}
