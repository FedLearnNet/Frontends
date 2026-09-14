import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFileManagementComponent } from './data-file-management.component';

describe('DataFileManagmentComponent', () => {
  let component: DataFileManagementComponent;
  let fixture: ComponentFixture<DataFileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataFileManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataFileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
