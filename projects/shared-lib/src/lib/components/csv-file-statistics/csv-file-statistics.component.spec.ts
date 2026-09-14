import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvFileStatisticsComponent } from './csv-file-statistics.component';

describe('CsvFileStatisticsComponent', () => {
  //let component: CsvFileStatisticsComponent;
  let fixture: ComponentFixture<CsvFileStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvFileStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvFileStatisticsComponent);
    //component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
