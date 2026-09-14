import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRunsComponent } from './project-runs.component';

describe('ProjectRunsComponent', () => {
  let component: ProjectRunsComponent;
  let fixture: ComponentFixture<ProjectRunsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRunsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectRunsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
