import {CommonModule} from '@angular/common';
import {Component, effect, inject, input} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SelectOption} from '@shared-lib/models';
import {CohortCriterionDto, CohortCriterionType, EvidenceVariableRole, QueryOperatorTypes} from '@local-app/cohort/models/cohort-criteria';
import {DataTypeTypeEnum} from '@local-app/cohort/dto/data-type';
import {SchemaRootNodeDto} from '@local-app/cohort/dto/schema';
import {
  DataModelDataTypeDto,
  DataModelForwardService,
  DataModelOntologyDto
} from '@local-app/cohort/services/data-model-forward.service';

const EXISTENCE_OPERATORS = [
  {label: 'Exists', value: QueryOperatorTypes.EXISTS},
  {label: 'Does not exist', value: QueryOperatorTypes.NOT_EXISTS},
];

const OPERATOR_OPTIONS: Partial<Record<DataTypeTypeEnum, SelectOption<QueryOperatorTypes>[]>> = {
  [DataTypeTypeEnum.INT]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    {label: 'Greater than', value: QueryOperatorTypes.BIGGER},
    {label: 'Greater than or equal', value: QueryOperatorTypes.BIGGER_EQUAL},
    {label: 'Less than', value: QueryOperatorTypes.SMALLER},
    {label: 'Less than or equal', value: QueryOperatorTypes.SMALLER_EQUAL},
    ...EXISTENCE_OPERATORS,
  ],
  [DataTypeTypeEnum.FLOAT]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    {label: 'Greater than', value: QueryOperatorTypes.BIGGER},
    {label: 'Greater than or equal', value: QueryOperatorTypes.BIGGER_EQUAL},
    {label: 'Less than', value: QueryOperatorTypes.SMALLER},
    {label: 'Less than or equal', value: QueryOperatorTypes.SMALLER_EQUAL},
    ...EXISTENCE_OPERATORS,
  ],
  [DataTypeTypeEnum.STRING]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    {label: 'Contains', value: QueryOperatorTypes.CONTAINS},
    {label: 'Does not contain', value: QueryOperatorTypes.NOT_CONTAINS},
    {label: 'Matches regex', value: QueryOperatorTypes.REGEX},
    {label: 'Starts with', value: QueryOperatorTypes.START_WIDTH},
    {label: 'Ends with', value: QueryOperatorTypes.END_WIDTH},
    ...EXISTENCE_OPERATORS,
  ],
  [DataTypeTypeEnum.BOOLEAN]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    ...EXISTENCE_OPERATORS,
  ],
  [DataTypeTypeEnum.DATE]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    {label: 'Before', value: QueryOperatorTypes.SMALLER},
    {label: 'On or before', value: QueryOperatorTypes.SMALLER_EQUAL},
    {label: 'After', value: QueryOperatorTypes.BIGGER},
    {label: 'On or after', value: QueryOperatorTypes.BIGGER_EQUAL},
    ...EXISTENCE_OPERATORS,
  ],
  [DataTypeTypeEnum.DATE_TIME]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    {label: 'Before', value: QueryOperatorTypes.SMALLER},
    {label: 'On or before', value: QueryOperatorTypes.SMALLER_EQUAL},
    {label: 'After', value: QueryOperatorTypes.BIGGER},
    {label: 'On or after', value: QueryOperatorTypes.BIGGER_EQUAL},
    ...EXISTENCE_OPERATORS,
  ],
  [DataTypeTypeEnum.CATEGORICAL]: [
    {label: 'Equals', value: QueryOperatorTypes.EQUAL},
    {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
    {label: 'In', value: QueryOperatorTypes.IN},
    {label: 'Not in', value: QueryOperatorTypes.NOT_IN},
    ...EXISTENCE_OPERATORS,
  ],
};

@Component({
  selector: 'app-cohort-criteria-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './cohort-criteria-editor.component.html',
  styleUrl: './cohort-criteria-editor.component.scss',
})
export class CohortCriteriaEditorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dataModelForwardService = inject(DataModelForwardService);

  criteria = input.required<FormArray<FormGroup>>();
  schema = input<SchemaRootNodeDto | undefined>();

  readonly criterionTypes = Object.values(CohortCriterionType);
  readonly variableRoles = Object.values(EvidenceVariableRole);
  readonly ontologyOptionsByIndex: DataModelOntologyDto[][] = [];
  readonly datatypeOptionsByIndex: DataModelDataTypeDto[][] = [];

  private readonly criteriaChangeEffect = effect(() => {
    this.criteria().controls.forEach((control, index) => this.ensureCriterionState(control, index));
  });

  addCriterion(type: CohortCriterionType = CohortCriterionType.INCLUSION): void {
    const group = this.createCriterionGroup({type, operator: []});
    this.criteria().push(group);
    this.ensureCriterionState(group, this.criteria().length - 1);
  }

  removeCriterion(index: number): void {
    this.criteria().removeAt(index);
    this.ontologyOptionsByIndex.splice(index, 1);
    this.datatypeOptionsByIndex.splice(index, 1);
  }

  operatorOptions(group: FormGroup): SelectOption<QueryOperatorTypes>[] {
    const dataType = this.findSelectedDataType(group);
    return OPERATOR_OPTIONS[dataType?.type as DataTypeTypeEnum] ?? EXISTENCE_OPERATORS;
  }

  valueOptions(group: FormGroup): SelectOption[] {
    const dataType = this.findSelectedDataType(group);
    const options = dataType?.options ?? [];
    if (options.length) {
      return options.map(option => ({label: option, value: option}));
    }
    return [];
  }

  isBoolean(group: FormGroup): boolean {
    return this.findSelectedDataType(group)?.type === DataTypeTypeEnum.BOOLEAN;
  }

  isCategorical(group: FormGroup): boolean {
    return this.findSelectedDataType(group)?.type === DataTypeTypeEnum.CATEGORICAL;
  }

  isValuelessOperator(group: FormGroup): boolean {
    const operator = group.getRawValue().operator;
    return operator === QueryOperatorTypes.EXISTS || operator === QueryOperatorTypes.NOT_EXISTS;
  }

  searchOntologies(index: number, search: string | null | undefined): void {
    this.dataModelForwardService.searchOntologies(search ?? '').subscribe(response => {
      this.ontologyOptionsByIndex[index] = response.results ?? [];
    });
  }

  onOntologySelected(index: number, group: FormGroup, ontology: DataModelOntologyDto): void {
    group.patchValue({
      ontologySearch: this.ontologyLabel(ontology),
      ontologyId: ontology.id,
      dataTypeId: '',
      operator: '',
      value: '',
    });
    this.loadDatatypes(index, ontology.id);
  }

  onDataTypeSelected(group: FormGroup): void {
    group.patchValue({
      operator: '',
      value: '',
    });
  }

  ontologyLabel(ontology: DataModelOntologyDto | undefined): string {
    if (!ontology) {
      return '';
    }
    return ontology.name ?? ontology.names?.[0] ?? ontology.codes?.[0] ?? ontology.cui ?? ontology.id;
  }

  datatypeLabel(dataType: DataModelDataTypeDto | undefined): string {
    if (!dataType) {
      return '';
    }
    return [dataType.name, dataType.type].filter(Boolean).join(' · ');
  }

  createCriterionGroup(criterion: CohortCriterionDto = {}): FormGroup {
    const operator = criterion.operator?.[0];
    const group = this.fb.nonNullable.group({
      id: [criterion.id ?? null],
      type: [criterion.type ?? CohortCriterionType.INCLUSION],
      variableRole: [criterion.variableRole ?? EvidenceVariableRole.POPULATION],
      description: [criterion.description ?? ''],
      ontologySearch: [criterion.ontologyId ?? ''],
      ontologyId: [criterion.ontologyId ?? ''],
      dataTypeId: [criterion.dataTypeId ?? ''],
      operator: [operator?.operator ?? ''],
      value: [operator?.value ?? ''],
    });
    return group;
  }

  toCriterionDto(group: FormGroup): CohortCriterionDto {
    const raw = group.getRawValue();
    const operator = raw.operator
      ? [{operator: raw.operator, value: this.isValuelessOperator(group) ? '' : raw.value}]
      : [];

    return {
      id: raw.id ?? undefined,
      type: raw.type,
      variableRole: raw.variableRole,
      description: raw.description || undefined,
      ontologyId: raw.ontologyId || undefined,
      dataTypeId: raw.dataTypeId || undefined,
      operator,
    };
  }

  private ensureCriterionState(group: FormGroup, index: number): void {
    if (!group.get('ontologySearch')) {
      group.addControl('ontologySearch', this.fb.nonNullable.control(group.getRawValue().ontologyId ?? ''));
    }
    this.ontologyOptionsByIndex[index] ??= [];
    this.datatypeOptionsByIndex[index] ??= [];
    const raw = group.getRawValue();
    if (raw.ontologyId && !this.datatypeOptionsByIndex[index].length) {
      this.loadDatatypes(index, raw.ontologyId);
    }
  }

  private loadDatatypes(index: number, ontologyId: string): void {
    this.dataModelForwardService.getDatatypesForOntology(ontologyId).subscribe(response => {
      this.datatypeOptionsByIndex[index] = response.results ?? [];
    });
  }

  private findSelectedDataType(group: FormGroup): DataModelDataTypeDto | undefined {
    const raw = group.getRawValue();
    return this.datatypeOptionsByIndex
      .flat()
      .find(dataType => `${dataType.id}` === `${raw.dataTypeId}`);
  }
}
