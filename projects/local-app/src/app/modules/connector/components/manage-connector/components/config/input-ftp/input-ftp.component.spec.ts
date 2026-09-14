import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepDataSourceInputFTPConfigComponent } from './input-ftp.component';

describe('ConnectorStepDataSourceInputFTPConfigComponent', () => {
  let component: ConnectorStepDataSourceInputFTPConfigComponent;
  let fixture: ComponentFixture<ConnectorStepDataSourceInputFTPConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepDataSourceInputFTPConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepDataSourceInputFTPConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
