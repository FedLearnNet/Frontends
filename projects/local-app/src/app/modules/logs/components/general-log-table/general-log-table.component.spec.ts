import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralLogTableComponent } from './general-log-table.component';

describe('GeneralLogTableComponent', () => {
  let component: GeneralLogTableComponent;
  let fixture: ComponentFixture<GeneralLogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralLogTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralLogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
