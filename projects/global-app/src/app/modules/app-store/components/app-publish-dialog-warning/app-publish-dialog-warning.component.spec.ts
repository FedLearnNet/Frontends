import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPublishDialogWarningComponent } from './app-publish-dialog-warning.component';

describe('AppPublishDialogWarningComponent', () => {
  let component: AppPublishDialogWarningComponent;
  let fixture: ComponentFixture<AppPublishDialogWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPublishDialogWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPublishDialogWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
