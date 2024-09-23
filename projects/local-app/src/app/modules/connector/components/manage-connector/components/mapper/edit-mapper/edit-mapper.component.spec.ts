import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorEditMapperComponent } from './edit-mapper.component';

describe('ConnectorEditMapperComponent', () => {
  let component: ConnectorEditMapperComponent;
  let fixture: ComponentFixture<ConnectorEditMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorEditMapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorEditMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
