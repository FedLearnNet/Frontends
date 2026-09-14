import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaCreateRootDialogComponent } from './schema-create-root-dialog.component';

describe('SchemaCreateRootDialogComponent', () => {
  let component: SchemaCreateRootDialogComponent;
  let fixture: ComponentFixture<SchemaCreateRootDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaCreateRootDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaCreateRootDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
