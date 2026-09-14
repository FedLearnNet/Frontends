import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepSpecifySelectorsChangeNameComponent } from './change-name.component';

describe('ConnectorStepSpecifySelectorsChangeNameComponent', () => {
  let component: ConnectorStepSpecifySelectorsChangeNameComponent;
  let fixture: ComponentFixture<ConnectorStepSpecifySelectorsChangeNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepSpecifySelectorsChangeNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepSpecifySelectorsChangeNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
