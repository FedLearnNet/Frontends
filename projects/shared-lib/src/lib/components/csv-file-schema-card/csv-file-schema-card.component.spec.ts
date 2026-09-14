import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileSchemaCardComponent } from './csv-file-schema-card.component';

describe('CsvFileSchemaCardComponent', () => {
  let component: CsvFileSchemaCardComponent;
  let fixture: ComponentFixture<CsvFileSchemaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvFileSchemaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvFileSchemaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
