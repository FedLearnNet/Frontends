import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppLogTableComponent } from './app-log-table.component';

describe('AppLogTableComponent', () => {
  let component: AppLogTableComponent;
  let fixture: ComponentFixture<AppLogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLogTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppLogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
