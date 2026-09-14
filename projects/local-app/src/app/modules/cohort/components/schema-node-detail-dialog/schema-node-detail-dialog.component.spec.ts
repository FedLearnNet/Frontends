import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaNodeDetailDialogComponent } from './schema-node-detail-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';
import {DatatypeFormTypeEnum, DataTypeTypeEnum} from '@local-app/cohort/dto/data-type';

describe('SchemaNodeDetailDialogComponent', () => {
  let component: SchemaNodeDetailDialogComponent;
  let fixture: ComponentFixture<SchemaNodeDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaNodeDetailDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            id: 1,
            name: 'Age',
            description: 'Patient age',
            nodeType: SchemaNodeTypeEnum.ATTRIBUTE,
            globalId: 'schema.age',
            ontology: {
              id: 2,
              name: 'Age',
              description: 'Age ontology'
            },
            dataType: {
              id: 3,
              name: 'Integer',
              description: 'Whole number',
              type: DataTypeTypeEnum.INT,
              formType: DatatypeFormTypeEnum.NUMBER
            }
          }
        },
        {
          provide: MatDialogRef,
          useValue: {
            updateSize: jasmine.createSpy('updateSize')
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaNodeDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
