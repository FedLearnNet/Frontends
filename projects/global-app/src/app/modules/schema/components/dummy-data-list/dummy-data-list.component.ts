import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  model,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {DataTypeDetailFlatten, DataTypeSubscriptionDTO, DummyDataRequestDTO} from "@global-app/schema/dto/datatype";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {SelectionModel} from "@angular/cdk/collections";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {get} from 'lodash';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DatatypeCardComponent} from '../datatype-card/datatype-card.component';
import {OntologyCardComponent} from '../ontology-card/ontology-card.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PatientExportFeatureDTO, SelectedDataIdsDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {
  SelectableDataCardComponent
} from "@global-app/schema/components/selectable-data-card/selectable-data-card.component";


@Component({
  selector: 'app-dummy-data-list',
  templateUrl: './dummy-data-list.component.html',
  styleUrl: './dummy-data-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatCheckbox, MatIconButton, DatatypeCardComponent, OntologyCardComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, ReactiveFormsModule, FormsModule, TranslatePipe, SelectableDataCardComponent, HeaderComponent]
})
export class DummyDataListComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dataTypeService: DataTypeService = inject(DataTypeService);

  allowSave = input<boolean>(false);
  hideBackBtn = input<boolean | undefined>(undefined);

  schemaId = input<string>();
  dataTypeIds = input.required<string[]>();
  dataTypes = input.required<DataTypeSubscriptionDTO[]>();
  selectedDataIds = model.required<SelectedDataIdsDTO[]>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  showDummyColumns: WritableSignal<boolean> = signal<boolean>(false);
  wideFormat: WritableSignal<boolean> = signal<boolean>(false);


  dataSource = new MatTableDataSource<DataTypeDetailFlatten>();
  displayedColumns: string[] = ['select', 'name', 'ontologyName', 'expand'];
  expandedElement: DataTypeDetailFlatten | null;
  selection = new SelectionModel<DataTypeDetailFlatten>(true, []);

  dummyColumns = signal<string[]>([]);
  dummyDataSource = signal<object[]>([]);
  schemaIdDict: object;

  reloadDataSource$ = effect(() => {
    const wideFormat = this.wideFormat();
    this.loadDummyData(wideFormat);
  });

  ngOnInit() {
    this.dataTypeService.getAllDetailedFlatten(this.schemaId(), this.dataTypeIds()).subscribe(datatypes => {
      if (this.dataTypes()) {
        datatypes = datatypes.map(dt => {
          const subscription = this.dataTypes().find(sub => sub.dataTypeId === dt.id);
          if (subscription) {
            dt.subscriptionsCount = subscription.subscriptionsCount;
          }
          return dt;
        });
      }
      this.dataSource = new MatTableDataSource(datatypes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: DataTypeDetailFlatten, filter: string): boolean => {
        return (
          (data.name ?? '').toString().trim().toLowerCase().includes(filter) ||
          (data.description ?? '').toString().trim().toLowerCase().includes(filter) ||
          (data?.ontology?.names?.join(",") ?? '').toString().trim().toLowerCase().includes(filter) ||
          (data?.ontology?.description ?? '').toString().trim().toLowerCase().includes(filter)
        );
      };

      this.selection.select(...datatypes.filter(dt => {
        const found = this.selectedDataIds().find(sub => sub.globalDataTypeId === dt.id && dt.ontology && sub.globalOntologyId === dt.ontology!.id);
        return found !== undefined;
      }));

      this.schemaIdDict = datatypes
        .filter(dt => dt.id && dt.ontology && dt.ontology!.id && dt.ontologyIds && dt.schemaIds)
        .map(dt => {
          const idx = dt.ontologyIds!.findIndex(oId => oId === dt.ontology!.id);
          return {
            compoundId: dt.ontology!.id + "@" + dt.id,
            schemaId: idx >= 0 && idx < dt.schemaIds!.length ? dt.schemaIds![idx] : "",
          };
        })
        .reduce<Record<string, string>>((result, item) => {
          result[item.compoundId] = item.schemaId;
          return result;
        }, {});

      if (this.selection.selected.length > 0) {
        this.loadDummyData(this.wideFormat());
      }
      this.cdr.detectChanges();
    });
  }

  save(): void {
    this.selectedDataIds.set(this.getSelected());
  }

  getFirstOntologyName(names?: string[]): string | null {
    return names && names.length > 0 ? names[0] : null;
  }

  getSelected(): SelectedDataIdsDTO[] {
    return this.selection.selected
      .filter(row => row.id)
      .filter(row => row.ontology && row.ontology!.id)
      .map(row => ({
        globalDataTypeId: row.id!,
        globalOntologyId: row.ontology!.id!,
      }))
  }

  loadDummyData(wideFormat: boolean): void {
    if (!this.showDummyColumns()) {
      return;
    }
    const features = this.getDummyDataFeatures();
    if (features.length === 0) {
      this.dummyColumns.set([]);
      this.dummyDataSource.set([]);
      return;
    }
    const request: DummyDataRequestDTO = {
      features,
      asFile: false,
      amount: 25,
      wideFormat,
    }
    this.dataTypeService.generateDummyData(request).subscribe(data => {
      if (data.length === 0) {
        this.dummyColumns.set([]);
        this.dummyDataSource.set([]);
        return;
      }
      this.dummyColumns.set(Object.keys(data[0]));
      this.dummyDataSource.set(data);
    });
  }

  openDetails(element: DataTypeDetailFlatten): void {
    this.expandedElement = this.expandedElement === element ? null : element;
    this.cdr.detectChanges();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }

  select(event: MatCheckboxChange, row: DataTypeDetailFlatten): void {
    if (event) {
      this.selection.toggle(row);
      this.loadDummyData(this.wideFormat());
    }
  }

  download(): void {
    const features = this.getDummyDataFeatures();
    if (features.length === 0) {
      return;
    }

    const request: DummyDataRequestDTO = {
      features,
      asFile: false,
      amount: 25,
      wideFormat: this.wideFormat(),
    }
    this.dataTypeService.downloadDummyData(request).subscribe(data => {
      data.click();
      this.cdr.detectChanges();
    });
  }

  toggleDummyColumns(): void {
    this.showDummyColumns.update(s => !s);
    this.loadDummyData(this.wideFormat());
  }

  private getDummyDataFeatures(): PatientExportFeatureDTO[] {
    return this.selection.selected
      .filter(row => row.id && row.ontology?.id)
      .map((row, index) => ({
        name: row.name || `Feature ${index + 1}`,
        order: index,
        allowedDataIds: [{
          globalDataTypeId: row.id!,
          globalOntologyId: row.ontology!.id!,
        }],
        targetDatatypeId: row.id!,
      }));
  }

  getSchemaNodeName(compoundId: string): string {
    //we display the schema node id as temp solution
    //TODO: display schema node name
    return <string>get(this.schemaIdDict, compoundId, '');
  }

}
