import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyDataListComponent } from './dummy-data-list.component';

describe('DummyDataListComponent', () => {
  let component: DummyDataListComponent;
  let fixture: ComponentFixture<DummyDataListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DummyDataListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyDataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
