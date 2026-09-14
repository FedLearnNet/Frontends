import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepConfigComponent } from './config.component';

describe('ConnectorStepConfigComponent', () => {
  let component: ConnectorStepConfigComponent;
  let fixture: ComponentFixture<ConnectorStepConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
