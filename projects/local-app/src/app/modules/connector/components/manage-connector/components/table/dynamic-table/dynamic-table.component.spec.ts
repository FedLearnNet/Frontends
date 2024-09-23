import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorDynamicTableComponent } from './dynamic-table.component';

describe('ConnectorDynamicTableComponent', () => {
  let component: ConnectorDynamicTableComponent;
  let fixture: ComponentFixture<ConnectorDynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorDynamicTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorDynamicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
