import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileViewerComponent } from './csv-file-viewer.component';

describe('CsvFileViewerComponent', () => {
 // let component: CsvFileViewerComponent;
  let fixture: ComponentFixture<CsvFileViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvFileViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvFileViewerComponent);
    //component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
