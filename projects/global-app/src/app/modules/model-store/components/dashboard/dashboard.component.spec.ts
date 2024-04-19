import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelStoreDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: ModelStoreDashboardComponent;
  let fixture: ComponentFixture<ModelStoreDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelStoreDashboardComponent]
    });
    fixture = TestBed.createComponent(ModelStoreDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
