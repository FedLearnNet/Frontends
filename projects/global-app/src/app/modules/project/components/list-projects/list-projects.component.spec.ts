import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectListsComponent} from './list-projects.component';

describe('ProjectListsComponent', () => {
  // let component: ProjectListsComponent;
  let fixture: ComponentFixture<ProjectListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectListsComponent);
    //component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
