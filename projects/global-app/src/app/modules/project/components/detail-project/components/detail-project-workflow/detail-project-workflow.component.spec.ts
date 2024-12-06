import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailProjectWorkflowComponent } from './detail-project-workflow.component';

describe('DetailProjectWorkflowComponent', () => {
  let component: DetailProjectWorkflowComponent;
  let fixture: ComponentFixture<DetailProjectWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailProjectWorkflowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailProjectWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
