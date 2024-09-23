import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunConnectorViewComponent } from './run-connector.component';

describe('RunConnectorViewComponent', () => {
  let component: RunConnectorViewComponent;
  let fixture: ComponentFixture<RunConnectorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunConnectorViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunConnectorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
