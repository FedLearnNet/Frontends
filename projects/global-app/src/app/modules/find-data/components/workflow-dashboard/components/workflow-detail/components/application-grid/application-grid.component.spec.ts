import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationGridComponent } from './application-grid.component';

describe('ApplicationGridComponent', () => {
  let component: ApplicationGridComponent;
  let fixture: ComponentFixture<ApplicationGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationGridComponent]
    });
    fixture = TestBed.createComponent(ApplicationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
