import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunHyperParamsComponent } from './run-hyper-params.component';

describe('RunHyperParamsComponent', () => {
  let component: RunHyperParamsComponent;
  let fixture: ComponentFixture<RunHyperParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunHyperParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunHyperParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
