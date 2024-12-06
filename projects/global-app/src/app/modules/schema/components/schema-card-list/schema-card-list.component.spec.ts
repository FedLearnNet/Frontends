import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaCardListComponent } from './schema-card-list.component';

describe('SchemaCardListComponent', () => {
  let component: SchemaCardListComponent;
  let fixture: ComponentFixture<SchemaCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaCardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
