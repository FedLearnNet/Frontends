import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunConnectorChangeLogComponent } from './run-change-log.component';

describe('RunConnectorChangeLogComponent', () => {
  let component: RunConnectorChangeLogComponent;
  let fixture: ComponentFixture<RunConnectorChangeLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunConnectorChangeLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunConnectorChangeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
