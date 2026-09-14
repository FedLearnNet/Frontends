import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepDataSourceConfigComponent } from './data-source.component';

describe('ConnectorStepDataSourceConfigComponent', () => {
  let component: ConnectorStepDataSourceConfigComponent;
  let fixture: ComponentFixture<ConnectorStepDataSourceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepDataSourceConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepDataSourceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
