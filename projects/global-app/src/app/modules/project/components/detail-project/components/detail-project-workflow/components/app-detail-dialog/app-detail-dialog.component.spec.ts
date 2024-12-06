import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailDialogComponent } from './app-detail-dialog.component';

describe('AppDetailDialogComponent', () => {
  let component: AppDetailDialogComponent;
  let fixture: ComponentFixture<AppDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
