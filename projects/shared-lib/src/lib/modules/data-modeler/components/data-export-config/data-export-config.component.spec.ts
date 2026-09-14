import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataExportConfigComponent } from './data-export-config.component';

describe('DataExportConfigComponent', () => {
  let component: DataExportConfigComponent;
  let fixture: ComponentFixture<DataExportConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataExportConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataExportConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
