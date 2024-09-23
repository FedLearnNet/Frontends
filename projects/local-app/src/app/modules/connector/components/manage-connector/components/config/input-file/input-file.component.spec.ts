import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepDataSourceInputFileConfigComponent } from './input-file.component';

describe('InputFileComponent', () => {
  let component: ConnectorStepDataSourceInputFileConfigComponent;
  let fixture: ComponentFixture<ConnectorStepDataSourceInputFileConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepDataSourceInputFileConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepDataSourceInputFileConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
