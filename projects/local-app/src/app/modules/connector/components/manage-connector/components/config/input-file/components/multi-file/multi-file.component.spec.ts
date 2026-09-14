import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepDataSourceMultiFileUploadComponent } from './multi-file.component';

describe('MultiFileComponent', () => {
  let component: ConnectorStepDataSourceMultiFileUploadComponent;
  let fixture: ComponentFixture<ConnectorStepDataSourceMultiFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepDataSourceMultiFileUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepDataSourceMultiFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
