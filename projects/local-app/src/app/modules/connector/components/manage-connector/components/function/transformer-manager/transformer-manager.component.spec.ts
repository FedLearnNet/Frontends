import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorTransformerFunctionManagerComponent } from './transformer-manager.component';

describe('ConnectorTransformerFunctionManagerComponent', () => {
  let component: ConnectorTransformerFunctionManagerComponent;
  let fixture: ComponentFixture<ConnectorTransformerFunctionManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorTransformerFunctionManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorTransformerFunctionManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
