import { Component, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { SelectOption } from '@shared-lib/models';
import { QueryConfig } from '@global-app/find-data/models';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataType } from '@global-app/find-data/enums';

@Component({
    selector: 'app-query-builder-item',
    templateUrl: './query-builder-item.component.html',
    styleUrl: './query-builder-item.component.scss',
})
export class QueryBuilderItemComponent implements OnInit, OnChanges {
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

    @Input() queryItem: any;
    @Input() isLastItem: boolean = false;
    @Input() queryConfigs: QueryConfig[];
    @Output() removeQueryItem = new EventEmitter<number>();
    @Output() queryabilityChanged = new EventEmitter<boolean>();

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

    constructor(
        private formBuilder: FormBuilder,
    ) { }


    ngOnInit(): void {
        this.filteredOptions = this.queryBuilderFormGroup.controls['name'].valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
        );

        this.queryBuilderFormGroup.valueChanges.subscribe(() => {
            this.queryabilityChanged.emit(true);
        });

        this.queryBuilderFormGroup.get('connector')?.disable();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['queryConfigs']) {
            this.loadQueryData();
        }
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
        this.removeQueryItem.emit(this.queryItem.id);
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

        this.queryBuilderFormGroup.patchValue({
            ontologyId: this.queryItem.ontologyId,
            operator: this.queryItem.operator,
            value: this.queryItem.value,
        });
    }
}
