import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  inject,
  Input,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {DataTypeDetailDTO, DataTypeSubscriptionDTO} from "@global-app/schema/dto/datatype";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {SelectionModel} from "@angular/cdk/collections";
import {MatCheckboxChange} from "@angular/material/checkbox";

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
})
export class DummyDataListComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dataTypeService: DataTypeService = inject(DataTypeService);

  @Input() allowSave: boolean = false;
  @Input() schemaId?: string;
  @Input() dataTypeIds?: string[];
  @Input() dataTypes: DataTypeSubscriptionDTO[] = [];
  @Input() showBreadcrumb = true;

  @Input() selectedDataTypeIds: string[] = [];
  @Output() selectedDataTypeIdsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<DataTypeDetailDTO>();
  displayedColumns: string[] = ['select', 'name', 'ontologyName', 'expand'];
  expandedElement: DataTypeDetailDTO | null;
  selection = new SelectionModel<DataTypeDetailDTO>(true, []);

  dummyColumns: string[] = [];
  dummyDataSource = new MatTableDataSource<object>();

  ngOnInit() {
    this.dataTypeService.getAllDetailed(this.schemaId, this.dataTypeIds).subscribe(datatypes => {

      datatypes = datatypes.map(dt => {
        const subscription = this.dataTypes.find(sub => sub.dataTypeId === dt.uniqueId);
        if (subscription) {
          dt.subscriptionsCount = subscription.subscriptionsCount;
        }
        return dt;
      });

      this.dataSource = new MatTableDataSource(datatypes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: DataTypeDetailDTO, filter: string): boolean => {
        return (
          (data.name ?? '').toString().trim().toLowerCase().includes(filter) ||
          (data.desc ?? '').toString().trim().toLowerCase().includes(filter) ||
          (data?.ontology?.name ?? '').toString().trim().toLowerCase().includes(filter) ||
          (data?.ontology?.desc ?? '').toString().trim().toLowerCase().includes(filter)
        );
      };

      this.selection.select(...datatypes.filter(dt => this.selectedDataTypeIds.includes(dt.uniqueId!)));
      if(this.selection.selected.length > 0) {
        this.loadDummyData();
      }
      this.cdr.detectChanges();
    });
  }

  save(): void {
    const ids = this.selection.selected.map(row => row.uniqueId).filter(id => !!(id));
    if (!ids || ids.length === 0) {
      return;
    }
    this.selectedDataTypeIdsChange.emit(ids as string[]);
  }

  loadDummyData(): void {
    const ids = this.selection.selected.map(row => row.uniqueId).filter(id => !!(id));
    if (!ids || ids.length === 0) {
      this.dummyColumns = [];
      this.dummyDataSource.data = [];
      return;
    }
    this.dataTypeService.generateDummyData(ids as string[]).subscribe(data => {
      if (data.length === 0) {
        this.dummyColumns = [];
        this.dummyDataSource.data = [];
        return;
      }
      this.dummyColumns = Object.keys(data[0]);
      this.dummyDataSource.data = data;
      this.cdr.detectChanges();

    });
  }

  openDetails(element: DataTypeDetailDTO): void {
    this.expandedElement = this.expandedElement === element ? null : element;
    this.cdr.detectChanges();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }

  select(event: MatCheckboxChange, row: DataTypeDetailDTO): void {
    if (event) {
      this.selection.toggle(row);
      this.loadDummyData();
    }
  }

  download(): void {
    const ids = this.selection.selected.map(row => row.uniqueId).filter(id => !!(id));
    if (!ids || ids.length === 0) {
      return;
    }
    this.dataTypeService.downloadDummyData(ids as string[]).subscribe(data => {
      data.click();
      this.cdr.detectChanges();
    });
  }

}
