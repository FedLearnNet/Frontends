import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaDetailTreeComponent } from './schema-detail-tree.component';

describe('SchemaDetailTreeComponent', () => {
  let component: SchemaDetailTreeComponent;
  let fixture: ComponentFixture<SchemaDetailTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaDetailTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaDetailTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
