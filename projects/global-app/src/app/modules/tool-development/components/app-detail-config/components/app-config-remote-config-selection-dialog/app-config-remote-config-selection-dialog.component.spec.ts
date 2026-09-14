import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfigRemoteConfigSelectionDialogComponent } from './app-config-remote-config-selection-dialog.component';

describe('AppConfigRemoteConfigSelectionDialogComponent', () => {
  let component: AppConfigRemoteConfigSelectionDialogComponent;
  let fixture: ComponentFixture<AppConfigRemoteConfigSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppConfigRemoteConfigSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppConfigRemoteConfigSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
