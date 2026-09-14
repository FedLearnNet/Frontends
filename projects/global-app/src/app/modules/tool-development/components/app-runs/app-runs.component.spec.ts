import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunsComponent } from './app-runs.component';

describe('AppRunsComponent', () => {
  let _component: AppRunsComponent;
  let fixture: ComponentFixture<AppRunsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunsComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});
