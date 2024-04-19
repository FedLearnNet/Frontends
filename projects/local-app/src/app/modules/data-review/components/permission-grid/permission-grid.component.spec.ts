import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionGridComponent } from './permission-grid.component';

describe('PermissionGridComponent', () => {
  let component: PermissionGridComponent;
  let fixture: ComponentFixture<PermissionGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PermissionGridComponent]
    });
    fixture = TestBed.createComponent(PermissionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
