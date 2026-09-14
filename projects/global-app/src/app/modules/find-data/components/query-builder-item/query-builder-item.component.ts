import {Component, computed, effect, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {startWith} from 'rxjs/operators';

import {QueryItemDTO, QueryOperatorDTO, QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {QueryConfig} from '@global-app/find-data/models';
import {DataTypes} from '@global-app/schema/dto/datatype';
import {SelectOption} from '@shared-lib/models';
import {isOperatorWithValue} from "@global-app/find-data/configs";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-query-builder-item',
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
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './query-builder-item.component.html',
  styleUrl: './query-builder-item.component.scss'
})
export class QueryBuilderItemComponent {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  readonly queryItem = input<QueryItemDTO>({} as QueryItemDTO);
  readonly isLastItem = input<boolean>(false);
  readonly queryConfigs = input<QueryConfig[]>([]);

  readonly queryabilityChanged = output<boolean>();
  readonly removeQueryItem = output<QueryItemDTO>();
  readonly queryItemChange = output<QueryItemDTO>();

  queryOptions: SelectOption<QueryOperatorTypes>[] = [];
  connectorOptions: string [] = ['AND'];

  queryBuilderFormGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    value: ['', Validators.required],
    operator: ['', Validators.required],
    ontologyId: ['', Validators.required],
    dataTypeId: ['', Validators.required],
    connector: [this.connectorOptions[0], Validators.required],
  });

  readonly nameValue = toSignal(
    this.queryBuilderFormGroup.controls['name'].valueChanges.pipe(startWith('')),
    {initialValue: ''}
  );
  readonly filteredOptions = computed<SelectOption[]>(() => {
    return this._filter(this.nameValue() || '');
  });
  readonly displayColumnName = (columnName: string | null): string => {
    if (!columnName) {
      return '';
    }

    return this.dynamicQueryColumns.find(option => option.value === columnName)?.label ?? columnName;
  };

  constructor() {
    effect(() => {
      this.hydrateFormFromQueryItem(this.queryItem(), this.queryConfigs());
    });

    this.queryBuilderFormGroup.valueChanges.subscribe(() => {
      const rawValue = this.queryBuilderFormGroup.getRawValue();
      const operator: QueryOperatorDTO = {
        operator: rawValue.operator as QueryOperatorTypes,
        value: this.serializeQueryValue(rawValue.value),
      }
      const queryItem: QueryItemDTO = {
        ontologyId: rawValue.ontologyId,
        dataTypeId: rawValue.dataTypeId,
        operator: [operator],
      }
      this.queryItemChange.emit(queryItem);
      this.queryabilityChanged.emit(true);
    });

    this.queryBuilderFormGroup.get('connector')?.disable();
  }

  get dataType(): typeof DataTypes {
    return DataTypes;
  }

  get selectedQueryConfig(): QueryConfig | undefined {
    return this.queryConfigs().find(queryConfig => queryConfig.name === this.queryBuilderFormGroup.getRawValue().name);
  }

  get isValuelessOperator(): boolean {
    const operator = this.queryBuilderFormGroup.getRawValue().operator as QueryOperatorTypes | '';
    return !isOperatorWithValue(operator);
  }

  get dynamicQueryColumns(): SelectOption[] {
    return this.queryConfigs().map(queryConfig => {
      return {
        label: `${queryConfig.name} (${queryConfig.label})`,
        value: queryConfig.name,
      }
    });
  }


  onColumnSelected(): void {
    const selectedQueryConfig = this.queryConfigs()
      .find(queryConfig => queryConfig.name === this.queryBuilderFormGroup.getRawValue().name);

    if (!selectedQueryConfig) {
      return;
    }

    this.queryOptions = selectedQueryConfig?.queryOperatorOption?.options ?? [];

    this.queryBuilderFormGroup.patchValue({
      value: '',
      operator: '',
      ontologyId: selectedQueryConfig.ontology.id,
      dataTypeId: selectedQueryConfig.dataType.id,
    });
  }

  onRemoveQueryItem(): void {
    this.removeQueryItem.emit(this.queryItem());
  }

  clearSelectedColumn(): void {
    this.queryBuilderFormGroup.patchValue({
      name: '',
      ontologyId: '',
      dataTypeId: '',
    });
  }

  private _filter(value: string): SelectOption[] {
    const filterValue = value.toLowerCase();

    return this.dynamicQueryColumns.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  private hydrateFormFromQueryItem(queryItem: QueryItemDTO, queryConfigs: QueryConfig[]): void {
    if (!queryItem?.ontologyId || !queryItem?.dataTypeId) {
      return;
    }

    const selectedQueryConfig = queryConfigs.find(queryConfig =>
      queryConfig.ontology.id === queryItem.ontologyId && queryConfig.dataType.id === queryItem.dataTypeId
    );
    const operator = queryItem.operator?.[0];

    this.queryOptions = selectedQueryConfig?.queryOperatorOption?.options ?? [];
    this.queryBuilderFormGroup.patchValue({
      name: selectedQueryConfig?.name ?? '',
      value: operator?.value ?? '',
      operator: operator?.operator ?? '',
      ontologyId: queryItem.ontologyId,
      dataTypeId: queryItem.dataTypeId,
    }, {emitEvent: false});
  }

  private serializeQueryValue(value: string | boolean | string[]): string | string[] {
    if (typeof value === 'boolean') {
      return `${value}`;
    }
    return value;
  }
}
