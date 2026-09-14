import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolIoGraphComponent } from './tool-io-graph.component';

describe('ToolIoGraphComponent', () => {
  let component: ToolIoGraphComponent;
  let fixture: ComponentFixture<ToolIoGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolIoGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolIoGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
