import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileDiagramComponent } from './csv-file-diagram.component';

describe('CsvFileDiagramComponent', () => {
  let component: CsvFileDiagramComponent;
  let fixture: ComponentFixture<CsvFileDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvFileDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvFileDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
