import {Component, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges, inject} from '@angular/core';
import {SelectOption} from '@shared-lib/models';
import {QueryConfig} from '@global-app/find-data/models';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DataType} from '@global-app/find-data/enums';
import {QueryItemDTO, QueryOperatorDTO} from "@global-app/find-data/dto/query";
import {CommonModule} from "@angular/common";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatRadioModule} from "@angular/material/radio";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-query-builder-item',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule
  ],
  templateUrl: './query-builder-item.component.html',
  styleUrl: './query-builder-item.component.scss',
})
export class QueryBuilderItemComponent implements OnInit, OnChanges {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  @Input() queryItem: QueryItemDTO;
  @Input() isLastItem: boolean = false;
  @Input() queryConfigs: QueryConfig[];
  @Output() removeQueryItem = new EventEmitter<QueryItemDTO>();
  @Output() queryabilityChanged = new EventEmitter<boolean>();


  @Output() queryItemChange = new EventEmitter<QueryItemDTO>();

  queryOptions: SelectOption[] = [];
  filteredOptions: Observable<SelectOption[]>;

  connectorOptions: string [] = ['AND'];

  queryBuilderFormGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    value: ['', Validators.required],
    operator: ['', Validators.required],
    ontologyId: ['', Validators.required],
    connector: [this.connectorOptions[0], Validators.required],
  });

  ngOnInit(): void {
    this.filteredOptions = this.queryBuilderFormGroup.controls['name'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.queryBuilderFormGroup.valueChanges.subscribe(() => {
      const rawValue = this.queryBuilderFormGroup.getRawValue();
      const operator: QueryOperatorDTO = {
        operator: rawValue.operator,
        value: rawValue.value,
      }
      const queryItem: QueryItemDTO = {
        ontologyId: rawValue.ontologyId,
        operator: [operator],
      }
      this.queryItemChange.emit(queryItem);
      this.queryabilityChanged.emit(true);
    });

    this.queryBuilderFormGroup.get('connector')?.disable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['queryConfigs']) {
      this.loadQueryData();
    }
  }

  get dataType(): typeof DataType {
    return DataType;
  }

  get selectedQueryConfig(): QueryConfig | undefined {
    return this.queryConfigs.find(queryConfig => queryConfig.name === this.queryBuilderFormGroup.getRawValue().name);
  }

  get dynamicQueryColumns(): SelectOption[] {
    return this.queryConfigs.map(queryConfig => {
      return {
        label: `${queryConfig.name} (${queryConfig.label})`,
        value: queryConfig.name,
      }
    });
  }


  onColumnSelected(): void {
    const selectedQueryConfig = this.queryConfigs
      .find(queryConfig => queryConfig.name === this.queryBuilderFormGroup.getRawValue().name);

    this.queryOptions = selectedQueryConfig?.queryOption.options ?? [];

    this.queryBuilderFormGroup.patchValue({
      value: '',
      operator: '',
      ontologyId: selectedQueryConfig?.ontologyId,
    });
  }

  onRemoveQueryItem(): void {
    this.removeQueryItem.emit(this.queryItem);
  }

  clearSelectedColumn(): void {
    this.queryBuilderFormGroup.patchValue({
      name: '',
      ontologyId: '',
    });
  }

  private _filter(value: string): SelectOption[] {
    const filterValue = value.toLowerCase();

    return this.dynamicQueryColumns.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  private loadQueryData(): void {
    this.queryBuilderFormGroup.patchValue({
      name: this.queryConfigs.find(queryConfig => queryConfig.ontologyId === this.queryItem.ontologyId)?.name ?? '',
    });

    this.onColumnSelected();

    if (!this.queryItem.operator || this.queryItem.operator.length === 0) {
      this.queryBuilderFormGroup.patchValue({
        ontologyId: this.queryItem.ontologyId
      });
      return;
    }
    const operator = this.queryItem.operator[0];
    let value: string | boolean | string[] = operator.value;
    if (this.selectedQueryConfig?.queryOption?.type === DataType.BOOLEAN) {
      value = value === 'true';
    }
    this.queryBuilderFormGroup.patchValue({
      ontologyId: this.queryItem.ontologyId,
      operator: operator.operator,
      value: value,
    });
  }
}
