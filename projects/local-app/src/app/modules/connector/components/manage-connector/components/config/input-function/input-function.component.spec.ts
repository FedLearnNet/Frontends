import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConnectorStepDataSourceInputFunctionConfigComponent} from './input-function.component';

describe('ConnectorStepDataSourceInputFunctionConfigComponent', () => {
  let component: ConnectorStepDataSourceInputFunctionConfigComponent;
  let fixture: ComponentFixture<ConnectorStepDataSourceInputFunctionConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepDataSourceInputFunctionConfigComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepDataSourceInputFunctionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
