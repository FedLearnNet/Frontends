import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunConnectorLogComponent } from './run-log.component';

describe('RunConnectorLogComponent', () => {
  let component: RunConnectorLogComponent;
  let fixture: ComponentFixture<RunConnectorLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunConnectorLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunConnectorLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
