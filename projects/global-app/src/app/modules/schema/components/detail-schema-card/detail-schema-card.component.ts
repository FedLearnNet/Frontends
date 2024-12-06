import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import {DataTypeDTO} from "@global-app/schema/dto/datatype";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {SchemaDetailDialog} from "@global-app/schema/model/schema";
import {EMPTY, map, Observable, of, tap} from "rxjs";
import {OntologyDTO} from "@global-app/schema/dto/ontology";
import {startWith} from "rxjs/operators";

@Component({
  selector: 'app-detail-schema-card',
  templateUrl: './detail-schema-card.component.html',
  styleUrl: './detail-schema-card.component.scss'
})
export class DetailSchemaCardComponent implements OnInit, AfterViewInit {
  readonly dialogRef = inject(MatDialogRef<DetailSchemaCardComponent>);
  readonly data = inject<SchemaDetailDialog>(MAT_DIALOG_DATA);
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  readonly schemaService: SchemaService = inject(SchemaService);
  readonly ontologyService: OntologyService = inject(OntologyService);

  autoCompleteControlDatatype = new FormControl('');

  schemaTypes: string[] = ['group', 'attribute'];

  ontologies: OntologyDTO[] = [];
  datatypes: DataTypeDTO[] = [];

  filteredOntologies$: Observable<OntologyDTO[]> = EMPTY;
  filteredDatatypes$: Observable<DataTypeDTO[]> = EMPTY;

  ontologyInput: string = '';

  ngOnInit(): void {
    this.ontologyService.getAll().subscribe(ontologies => {
      this.ontologies = ontologies;
      const ontology = this.getOntology();
      if (ontology && ontology.uniqueId) {
        this.ontologyInput = ontology.uniqueId;
        this.loadDatatypes(ontology.uniqueId);
      }
    });


  }

  ngAfterViewInit(): void {

    this.filteredDatatypes$ = this.autoCompleteControlDatatype.valueChanges.pipe(
      tap(value => console.log(value)),
      startWith(''),
      map(value => this.filterDatatypes(value || '')),
    );
  }

  filterOntology(event: Event) {
    const value = (event.target as any).value as string;
    const filterValue = value.toLowerCase();
    const filteredOntology =  this.ontologies
      .filter(ontology => ontology.name.toLowerCase().includes(filterValue) ||
        ontology.uniqueId!.toLowerCase().includes(filterValue));

    this.filteredOntologies$ = of(filteredOntology);
  }


  isDisabled(): boolean {
    return false;
  }

  getDataType(): DataTypeDTO | undefined {
    const id = this.data.current?.dataTypeId;
    if (id) {
      return this.datatypes.find(d => d.uniqueId === id);
    }
    return undefined;

  }

  getOntology(): OntologyDTO | undefined {
    const id = this.data.current?.ontologyId;
    if (id) {
      return this.ontologies.find(d => d.uniqueId === id);
    }
    return undefined;
  }

  loadDatatypes(ontologyId?: string) {
    if (!ontologyId) {
      return;
    }
    this.dataTypeService.getAll(ontologyId).subscribe(datatypes => {
      this.datatypes = datatypes;
      const datatype = this.getDataType();
      if (datatype && datatype.uniqueId) {
        this.autoCompleteControlDatatype.setValue(datatype.uniqueId);
      }
    })
  }

  addOntology() {
    if (this.ontologyInput) {
      this.data.current!.ontologyId = this.ontologyInput;
      this.data.current!.dataTypeId = undefined;
      this.loadDatatypes(this.ontologyInput);
    }
  }

  addDatatype() {
    if (this.autoCompleteControlDatatype.value) {
      this.data.current!.dataTypeId = this.autoCompleteControlDatatype.value!;
    }
  }

  private filterDatatypes(value: string): DataTypeDTO[] {
    const filterValue = value.toLowerCase();

    return this.datatypes
      .filter(datatype => datatype.name.toLowerCase().includes(filterValue) ||
        datatype.uniqueId!.toLowerCase().includes(filterValue));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    const schema = this.data.current!;
    if (schema.uniqueId) {
      this.schemaService.update(schema).subscribe((updatedSchema) => {
        this.dialogRef.close(updatedSchema);
      });
    } else {
      schema.parentId = this.data.parent!.uniqueId;
      this.schemaService.persist(schema).subscribe((newSchema) => {
        this.dialogRef.close(newSchema);
      })
    }
  }


}
