import {Component, computed, effect, inject, OnInit, signal, untracked} from '@angular/core';
import {forkJoin, of} from "rxjs";
import {apply, form, FormField} from "@angular/forms/signals";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {DataTypeNodeDTO} from "@global-app/schema/dto/datatype";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {SchemaDetailDialog} from "@global-app/schema/model/schema";
import {schemaNodeFormSchema, toSchemaNodeForm} from "@global-app/schema/model/schema-node-form";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {OntologyCardComponent} from '../ontology-card/ontology-card.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {DatatypeCardComponent} from '../datatype-card/datatype-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {SchemaNodeDetailDTO, SchemaNodeType} from "@global-app/schema/dto/schema";
import {pagedSearch} from "@shared-lib/utils/paged-search";
import {AutocompleteInfiniteScrollDirective} from "@shared-lib/directives/autocomplete-infinite-scroll.directive";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {getSchemaName, isSchemaAttribute} from "@global-app/schema/utils/schema-utils";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

const DEFAULT_WIDTH = 'min(960px, 94vw)';

@Component({
  selector: 'app-detail-schema-card',
  templateUrl: './detail-schema-card.component.html',
  styleUrl: './detail-schema-card.component.scss',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInput,
    FormField,
    MatSelectModule,
    OntologyCardComponent,
    MatAutocompleteModule,
    DatatypeCardComponent,
    TranslatePipe,
    PageWrapperComponent,
    BtnComponent,
    BadgeComponent,
    CloseableDialogTitleComponent,
    EmptyStateComponent,
    AutocompleteInfiniteScrollDirective,
  ],
  host: {'[class.maximized]': 'maximized()'}
})
export class DetailSchemaCardComponent implements OnInit {
  static readonly dialogConfig: MatDialogConfig = {
    width: DEFAULT_WIDTH,
    maxWidth: '100vw',
    maxHeight: '100vh',
    autoFocus: false,
  };

  readonly data = inject<SchemaDetailDialog>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DetailSchemaCardComponent>);
  readonly dataTypeService = inject(DataTypeService);
  readonly ontologyService = inject(OntologyService);

  schemaTypes: SchemaNodeType[] = [SchemaNodeType.GROUP, SchemaNodeType.ATOMIC_ATTRIBUTE, SchemaNodeType.LIST_ATTRIBUTE];

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly maximized = signal<boolean>(false);

  readonly model = signal(toSchemaNodeForm(this.data.current));

  readonly schemaForm = form(this.model, p => {
    apply(p, schemaNodeFormSchema);
  });

  readonly selectedOntology = computed(() => this.model().ontology);
  readonly selectedDatatype = computed(() => this.model().dataType);
  readonly isAttribute = computed(() => {
    const type = this.model().type;
    return !!type && isSchemaAttribute(type);
  });

  private datatypesOntologyId = this.data.current?.ontologyId;

  readonly ontologies = pagedSearch(
    (search, page, pageSize) => this.ontologyService.getAllFiltered(search, page, pageSize),
    {pageSize: 20}
  );

  readonly datatypes = pagedSearch<DataTypeNodeDTO>(
    (search, page, pageSize) => {
      const ontologyId = this.datatypesOntologyId;
      return ontologyId
        ? this.dataTypeService.getAll(page, pageSize, ontologyId, search)
        : of({page, pageSize, totalCount: 0, results: []});
    },
    {pageSize: 20}
  );

  private readonly resetDatatypeOnOntologyChange = effect(() => {
    if (this.loading()) return;
    const ontologyId = this.selectedOntology()?.id;
    untracked(() => {
      if (ontologyId === this.datatypesOntologyId) return;
      this.datatypesOntologyId = ontologyId;
      this.schemaForm.dataType().value.set(null);
      this.datatypes.reload();
    });
  });

  ngOnInit(): void {
    if (this.data.current?.type === SchemaNodeType.ROOT) {
      this.schemaTypes = [SchemaNodeType.ROOT];
    }

    this.loadMissingSelections();
  }

  onOntologyInput(event: Event): void {
    this.ontologies.search((event.target as HTMLInputElement).value);
  }

  onDatatypeInput(event: Event): void {
    this.datatypes.search((event.target as HTMLInputElement).value);
  }

  private loadMissingSelections(): void {
    const current = this.data.current;
    const ontology$ = current?.ontologyId && !this.selectedOntology()
      ? this.ontologyService.getById(current.ontologyId) : of(this.selectedOntology());
    const dataType$ = current?.dataTypeId && !this.selectedDatatype()
      ? this.dataTypeService.getById(current.dataTypeId) : of(this.selectedDatatype());

    this.loading.set(true);
    forkJoin([ontology$, dataType$]).subscribe({
      next: ([ontology, dataType]) => {
        this.model.update(m => ({...m, ontology: ontology ?? null, dataType: dataType ?? null}));
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.message ?? 'Error loading the selected ontology or datatype.');
        this.loading.set(false);
      }
    });
  }

  toggleMaximize(isMaximized: boolean): void {
    this.maximized.set(isMaximized);
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize(DEFAULT_WIDTH, '');
    }
  }

  save(): void {
    if (!this.schemaForm().valid()) return;
    const {name, description, type, ontology, dataType} = this.model();
    const schema = {
      ...this.data.current,
      name: name.trim(),
      description: description.trim(),
      type: type!,
      ontologyId: ontology?.id,
      ontology: ontology ?? undefined,
      dataTypeId: dataType?.id,
      dataType: dataType ?? undefined,
    } as SchemaNodeDetailDTO;
    if (!schema.id && this.data.parent?.id) {
      schema.parentId = this.data.parent.id;
    }
    this.dialogRef.close(schema);
  }

  protected readonly ontologyLabel = (ontology: OntologyNodeDTO | null): string =>
    ontology ? `${ontology.names?.[0] ?? ''} (${ontology.id})`.trim() : '';
  protected readonly datatypeLabel = (dataType: DataTypeNodeDTO | null): string =>
    dataType ? `${dataType.name ?? ''} (${dataType.id})`.trim() : '';

  protected readonly getSchemaName = getSchemaName;
}
