import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SchemaNodeDetailComponent, SchemaNodeDetailData} from './schema-node-detail.component';
import {SchemaNodeDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from '@local-app/cohort/dto/schema';
import {
  DataTypeDto,
  DataTypeValidationNameEnum,
  DatatypeFormTypeEnum,
  DataTypeTypeEnum
} from '@local-app/cohort/dto/data-type';

const NOT_APPLICABLE = 'Not applicable for group/root nodes';

function dataType(overrides: Partial<DataTypeDto>): DataTypeDto {
  return {
    id: 3,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'generic integer',
    description: 'Whole number',
    type: DataTypeTypeEnum.INT,
    formType: DatatypeFormTypeEnum.NUMBER,
    ...overrides
  };
}

function attributeNode(nodeType: SchemaNodeTypeEnum, dt: DataTypeDto): SchemaNodeDto {
  return {
    id: 1,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Attribute',
    nodeType,
    parentId: 10,
    globalId: 'schema.attribute',
    ontology: {
      id: 2,
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Year of birth',
      description: 'Ontology of the attribute'
    },
    dataType: dt
  };
}

describe('SchemaNodeDetailComponent', () => {
  let component: SchemaNodeDetailComponent;
  let fixture: ComponentFixture<SchemaNodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaNodeDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SchemaNodeDetailComponent);
    component = fixture.componentInstance;
  });

  function render(node: SchemaNodeDetailData): string {
    fixture.componentRef.setInput('node', node);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent!.toUpperCase();
  }

  for (const nodeType of [SchemaNodeTypeEnum.ATTRIBUTE, SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE, SchemaNodeTypeEnum.LIST_ATTRIBUTE]) {
    it(`shows ontology and datatype details of ${nodeType} nodes`, () => {
      const text = render(attributeNode(nodeType, dataType({name: 'birth year'})));

      expect(component.isStructuralNode()).toBeFalse();
      expect(text).toContain('YEAR OF BIRTH');
      expect(text).toContain('BIRTH YEAR');
      expect(text).toContain(DataTypeTypeEnum.INT);
      expect(text).not.toContain(NOT_APPLICABLE.toUpperCase());
    });
  }

  it('shows the options of a categorical datatype as allowed values', () => {
    const text = render(attributeNode(SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE, dataType({
      name: 'education level',
      type: DataTypeTypeEnum.CATEGORICAL,
      formType: DatatypeFormTypeEnum.SELECT,
      options: [
        {label: 'Illiterate', value: 'Illiterate'},
        {label: 'University education', value: 'University education'}
      ]
    })));

    expect(text).toContain('ILLITERATE');
    expect(text).toContain('UNIVERSITY EDUCATION');
    expect(text).not.toContain('(ILLITERATE)');
    expect(text).toContain('NO VALIDATION RULES CONFIGURED');
  });

  it('falls back to the allowed values when a datatype has no options', () => {
    const text = render(attributeNode(SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE, dataType({
      name: 'Boolean',
      type: DataTypeTypeEnum.BOOLEAN,
      formType: DatatypeFormTypeEnum.RADIO,
      allowedValues: ['True', 'False']
    })));

    expect(text).toContain('TRUE');
    expect(text).toContain('FALSE');
    expect(text).not.toContain('NO ALLOWED VALUES CONFIGURED');
  });

  it('shows MIN and MAX validations of a numeric datatype', () => {
    const text = render(attributeNode(SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE, dataType({
      validations: [
        {name: DataTypeValidationNameEnum.MIN, validator: '1900', message: 'Value must be greater or equal to 1900'},
        {name: DataTypeValidationNameEnum.MAX, validator: '2099', message: 'Value must be smaller or equal to 2099'}
      ]
    })));

    expect(text).toContain('MIN: 1900 - VALUE MUST BE GREATER OR EQUAL TO 1900');
    expect(text).toContain('MAX: 2099 - VALUE MUST BE SMALLER OR EQUAL TO 2099');
    expect(text).toContain('NO ALLOWED VALUES CONFIGURED');
  });

  it('shows the PATTERN validation of a string datatype', () => {
    const text = render(attributeNode(SchemaNodeTypeEnum.LIST_ATTRIBUTE, dataType({
      name: 'LOINC code',
      type: DataTypeTypeEnum.STRING,
      formType: DatatypeFormTypeEnum.TEXT,
      validations: [
        {name: DataTypeValidationNameEnum.PATTERN, validator: '^[0-9]{1,8}-[0-9]$', message: 'LOINC code must be 1-8 digits'}
      ]
    })));

    expect(text).toContain('PATTERN: ^[0-9]{1,8}-[0-9]$ - LOINC CODE MUST BE 1-8 DIGITS');
  });

  it('shows the date range validations of a date datatype', () => {
    const text = render(attributeNode(SchemaNodeTypeEnum.LIST_ATTRIBUTE, dataType({
      name: 'date',
      type: DataTypeTypeEnum.DATE,
      formType: DatatypeFormTypeEnum.DATE,
      validations: [
        {name: DataTypeValidationNameEnum.MIN, validator: '1900-01-01'},
        {name: DataTypeValidationNameEnum.MAX, validator: '9999-01-01'}
      ]
    })));

    expect(text).toContain('MIN: 1900-01-01');
    expect(text).toContain('MAX: 9999-01-01');
  });

  it('shows notices for a datatype without validations and allowed values', () => {
    const text = render(attributeNode(SchemaNodeTypeEnum.ATOMIC_ATTRIBUTE, dataType({})));

    expect(text).toContain('NO VALIDATION RULES CONFIGURED');
    expect(text).toContain('NO ALLOWED VALUES CONFIGURED');
  });

  it('treats group nodes as structural nodes', () => {
    const group = {...attributeNode(SchemaNodeTypeEnum.GROUP, dataType({})), ontology: undefined, dataType: undefined};
    const text = render(group as unknown as SchemaNodeDto);

    expect(component.isStructuralNode()).toBeTrue();
    expect(text).toContain(NOT_APPLICABLE.toUpperCase());
  });

  it('treats root nodes as structural nodes', () => {
    const root: SchemaRootNodeDto = {
      id: 1,
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Root',
      globalId: 'schema',
      globalVersion: 1,
      nodeType: SchemaNodeTypeEnum.ROOT,
      childNodes: []
    };
    const text = render(root);

    expect(component.isStructuralNode()).toBeTrue();
    expect(text).toContain(NOT_APPLICABLE.toUpperCase());
  });
});
