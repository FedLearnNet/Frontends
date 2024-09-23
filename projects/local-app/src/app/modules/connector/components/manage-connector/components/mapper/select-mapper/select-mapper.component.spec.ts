import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorSelectMapperComponent } from './select-mapper.component';

describe('ConnectorSelectMapperComponent', () => {
  let component: ConnectorSelectMapperComponent;
  let fixture: ComponentFixture<ConnectorSelectMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorSelectMapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorSelectMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
