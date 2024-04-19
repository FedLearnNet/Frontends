import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDataComponent } from './find-data.component';

describe('FindDataComponent', () => {
  let component: FindDataComponent;
  let fixture: ComponentFixture<FindDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FindDataComponent]
    });
    fixture = TestBed.createComponent(FindDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
