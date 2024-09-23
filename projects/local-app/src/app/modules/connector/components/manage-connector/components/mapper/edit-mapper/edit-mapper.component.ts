import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ConnectorSelectMapperComponent} from "../select-mapper/select-mapper.component";
import {ConnectorPreviewService} from "../../../../../services/connector-preview.service";
import {ConnectorMappingConfig} from "../../../../../models/connector-model";
import {cloneDeep, forEach} from "lodash";
import {ConnectorMappingElement} from "../../../../../models/connector-preview";
import {getArrayOrString, isArray, ListViewComponentDialogComponent} from "../../table/list-view/list-view.component";
import {Schema} from "@shared-lib/models";
import {ActivatedRoute, Data} from "@angular/router";


const ELEMENT_DATA: ConnectorMappingElement[] = [];
type RouteData = Data & { breadcrumb: string | any, schema: Schema }


@Component({
  selector: 'app-edit-mapper',
  templateUrl: './edit-mapper.component.html',
  styleUrl: './edit-mapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectorEditMapperComponent implements OnInit {
  displayedColumns: string[] = ['column', 'data', 'mapping', 'validation'];
  schema: Schema
  cachedConfig: ConnectorMappingConfig[] = [];

  filterMappedStatus: string[] = [];
  filterMapped: string[] = [];

  @Input() columns: string[] = [];
  @Input() inputData: any[] = [];
  @Input() changedConfig: ConnectorMappingConfig[] | undefined = [];
  @Output() changeMapping: EventEmitter<ConnectorMappingConfig[]> = new EventEmitter<ConnectorMappingConfig[]>()
  @Output() cardDetail: EventEmitter<string> = new EventEmitter<string>()

  dataSource = [...ELEMENT_DATA];
  tableDataSource = [...ELEMENT_DATA];

  constructor(private activatedRoute: ActivatedRoute,
              private connectorPreviewService: ConnectorPreviewService,
              public dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      const routeData = data as RouteData;
      this.schema = routeData.schema;
    });

    const showedData = this.inputData[0]
    this.columns.map(column => {
      const data = showedData[column];
      this.dataSource.push({column: column, data: data, mapping: "Mapping", validation: ''})
    });
    this.applyConfig(this.changedConfig);
    this.changeDetectorRef.detectChanges();
  }

  viewSelectedColumn(element: ConnectorMappingElement) {
    const column = element.column;
    const mapping = element.mappingConfig?.value;
    const usedPaths: string[] = this.getUsedPaths();
    const dialogRef = this.dialog.open(ConnectorSelectMapperComponent, {
      data: {
        column: column,
        value: mapping,
        schema: cloneDeep(this.schema),
        removeFieldsPath: usedPaths,
      }
    });
    dialogRef.afterClosed().subscribe((result: {
      displayValue: string,
      value: string,
      clearValueIfBlank: string,
    }) => {
      if (!result) return;
      element.validation = 'Sync';
      element.mappingConfig = result;
      element.mapping = result.displayValue || "Mapping";
      if (element.mapping === 'Mapping') {
        element.validation = '';
        element.mappingConfig = undefined;
      }
      this.refreshTableData()
      this.validateColumns([element]);
    });
  }

  validateColumns(elements: ConnectorMappingElement[]) {
    forEach(elements, (element) => {
      if (!element.mappingConfig) return;
      if (!element.mappingConfig.value) return;
      this.connectorPreviewService.testValue(this.schema.uniqueId, element.data, element.mappingConfig.value).subscribe(data => {
        element.validation = data;
        this.refreshTableData()
      });
    });
  }

  refreshTableData() {
    this.filterTable();
    this.changeDetectorRef.detectChanges();
    this.onChangeMapping();
  }

  filterTable() {
    this.tableDataSource = this.dataSource.filter(element => {
      if (this.filterMapped.includes('Mapped') && !element.mappingConfig) return false;
      if (this.filterMapped.includes('Unmapped') && element.mappingConfig) return false;
      if (this.filterMappedStatus.includes('Valid') && element.validation !== 'Valid') return false;
      return !(this.filterMappedStatus.includes('Invalid') && (!element.validation || element.validation === 'Valid'
        || element.validation === 'Sync'));

    });
  }

  applyConfig(newConfig: ConnectorMappingConfig[] | undefined) {
    if (!newConfig || newConfig.length === 0) {
      this.refreshTableData();
      return;
    }
    if (JSON.stringify(newConfig) === JSON.stringify(this.cachedConfig)) return;
    const foundedColumn: ConnectorMappingElement[] = [];
    this.dataSource.map(element => {
      const config = newConfig.find(config => config.column === element.column);
      if (config) {
        element.mappingConfig = {
          displayValue: config.mapping,
          value: config.mapping,
          clearValueIfBlank: ''
        };
        element.mapping = config.mapping.replaceAll('.', ' > ');
        foundedColumn.push(element);
      }
    });
    this.validateColumns(foundedColumn);
    this.refreshTableData();
    this.onChangeMapping()
  }

  onChangeMapping() {
    const mappingConfig: ConnectorMappingConfig[] = [];
    this.dataSource.forEach(element => {
      if (element.mappingConfig) {
        mappingConfig.push({
          column: element.column,
          mapping: element.mappingConfig.value
        });
      }
    });
    this.cachedConfig = mappingConfig;
    this.changeMapping.emit(mappingConfig);
    this.cardDetail.emit(this.getCardDetail(mappingConfig));
  }

  getUsedPaths(): string[] {
    const paths: string[] = [];
    this.dataSource.forEach(element => {
      if (element.mappingConfig) {
        paths.push(element.mappingConfig.value);
      }
    });
    return paths;
  }

  private getInformationString(name: string, value: any, newline = false, strong = true) {
    let content = '';
    if (newline) {
      content = `<br>`;
    }
    if (strong) {
      content += `<span><strong>${name}:</strong> ${value}</span>`;
    } else {
      content += `<span>${name}: ${value}</span>`;
    }
    return content;
  }

  getCardDetail(mappingConfig: ConnectorMappingConfig[]): string {
    let content = '';
    const mapped = mappingConfig.length;
    const unmapped = this.columns.length - mapped;
    if (mapped > 0) {
      content += this.getInformationString('Mapped Fields', mapped);
      const validMapping = this.dataSource.filter(element => element.validation === 'Valid');
      const invalidMapping = this.dataSource.filter(element => element.validation && element.validation !== 'Valid' && element.validation !== 'Sync');
      const pendingMapping = this.dataSource.filter(element => element.validation === 'Sync');
      if (validMapping.length > 0) {
        content += this.getInformationString('Valid', validMapping.length, true, false);
      }
      if (invalidMapping.length > 0) {
        content += this.getInformationString('Invalid', invalidMapping.length, true, false);
      }
      if (pendingMapping.length > 0) {
        content += this.getInformationString('Pending', pendingMapping.length, true, false);
      }
    }
    if (unmapped > 0) {
      content += this.getInformationString('Unmapped Fields', unmapped, true);
    }
    return content;
  }

  getValue(data: any): string {
    if (data === null || data === undefined) {
      return "";
    }
    return getArrayOrString(data, 0);

  }

  isList(data: any): boolean {
    if (!data) {
      return false;
    }
    return isArray(data);
  }

  openArrayDialog(data: any, column: string): void {
    this.dialog.open(ListViewComponentDialogComponent, {
      data: {list: getArrayOrString(data), name: column},
      minWidth: '200px',
    });
  }
}
