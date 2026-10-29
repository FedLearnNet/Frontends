import {ChangeDetectionStrategy, Component, effect, inject, OnInit, signal} from '@angular/core';
import {forkJoin, of} from "rxjs";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {DataTypeNodeDTO} from "@global-app/schema/dto/datatype";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {SchemaDetailDialog} from "@global-app/schema/model/schema";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {OntologyCardComponent} from '../ontology-card/ontology-card.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {DatatypeCardComponent} from '../datatype-card/datatype-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {SchemaNodeType} from "@global-app/schema/dto/schema";
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInput,
    ReactiveFormsModule,
    FormsModule,
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
  /** Open with this config so the dialog sizes to its content and scrolls instead of overflowing the viewport. */
  static readonly dialogConfig: MatDialogConfig = {
    width: DEFAULT_WIDTH,
    maxWidth: '100vw',
    maxHeight: '100vh',
    autoFocus: false,
  };

  readonly dialogRef = inject(MatDialogRef<DetailSchemaCardComponent>);
  readonly data = inject<SchemaDetailDialog>(MAT_DIALOG_DATA);
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  readonly ontologyService: OntologyService = inject(OntologyService);

  readonly ontologyCtrl = new FormControl<OntologyNodeDTO | null>(null);
  readonly datatypeCtrl = new FormControl<DataTypeNodeDTO | null>(null);

  schemaTypes: SchemaNodeType[] = [SchemaNodeType.GROUP, SchemaNodeType.ATOMIC_ATTRIBUTE, SchemaNodeType.LIST_ATTRIBUTE];

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly maximized = signal<boolean>(false);

  readonly selectedOntology = signal<OntologyNodeDTO | undefined>(
    this.data.current?.ontology?.id === this.data.current?.ontologyId ? this.data.current?.ontology : undefined
  );
  readonly selectedDatatype = signal<DataTypeNodeDTO | undefined>(
    this.data.current?.dataType?.id === this.data.current?.dataTypeId ? this.data.current?.dataType : undefined
  );

  readonly ontologies = pagedSearch(
    (search, page, pageSize) => this.ontologyService.getAllFiltered(search, page, pageSize),
    {pageSize: 20}
  );

  readonly datatypes = pagedSearch<DataTypeNodeDTO>(
    (search, page, pageSize) => {
      const ontologyId = this.data.current?.ontologyId;
      return ontologyId
        ? this.dataTypeService.getAll(page, pageSize, ontologyId, search)
        : of({page, pageSize, totalCount: 0, results: []});
    },
    {pageSize: 20}
  );

  private readonly syncDatatypeCtrlState = effect(() => {
    if (this.selectedOntology()) {
      this.datatypeCtrl.enable({emitEvent: false});
    } else {
      this.datatypeCtrl.disable({emitEvent: false});
    }
  });

  ngOnInit(): void {
    if (this.data.current?.type === SchemaNodeType.ROOT) {
      this.schemaTypes = [SchemaNodeType.ROOT];
    }

    this.loadMissingSelections();
  }

  isDisabled(): boolean {
    return false;
  }

  onOntologyInput(event: Event): void {
    this.ontologies.search((event.target as HTMLInputElement).value);
  }

  onDatatypeInput(event: Event): void {
    this.datatypes.search((event.target as HTMLInputElement).value);
  }

  selectOntology(ontology: OntologyNodeDTO): void {
    const current = this.data.current!;
    if (current.ontologyId === ontology.id) return;

    current.ontologyId = ontology.id;
    current.ontology = ontology;
    this.selectedOntology.set(ontology);

    current.dataTypeId = undefined;
    this.selectedDatatype.set(undefined);
    this.datatypeCtrl.setValue(null, {emitEvent: false});
    this.datatypes.reload();
  }

  selectDatatype(dataType: DataTypeNodeDTO): void {
    const current = this.data.current!;
    current.dataTypeId = dataType.id;
    current.dataType = dataType;
    this.selectedDatatype.set(dataType);
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
        this.selectedOntology.set(ontology);
        this.selectedDatatype.set(dataType);
        this.ontologyCtrl.setValue(ontology ?? null, {emitEvent: false});
        this.datatypeCtrl.setValue(dataType ?? null, {emitEvent: false});
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

  isValid(): boolean {
    const current = this.data.current;
    return !!(current?.name?.trim() && current.description?.trim() && current.type);
  }

  save(): void {
    if (!this.isValid()) return;
    const schema = this.data.current!;
    if (!schema.id && this.data.parent?.id) {
      schema.parentId = this.data.parent.id;
    }
    this.dialogRef.close(schema);
  }

  protected readonly ontologyLabel = (ontology: OntologyNodeDTO | null): string =>
    ontology ? `${ontology.names?.[0] ?? ''} (${ontology.id})`.trim() : '';
  protected readonly datatypeLabel = (dataType: DataTypeNodeDTO | null): string =>
    dataType ? `${dataType.name ?? ''} (${dataType.id})`.trim() : '';

  protected readonly isSchemaAttribute = isSchemaAttribute;
  protected readonly getSchemaName = getSchemaName;
  protected readonly JSON = JSON;
}
