import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConfirmDialogWithSettingsComponent} from './confirm-dialog-with-settings.component';

describe('ConfirmDialogWithSettingsComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogWithSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogWithSettingsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogWithSettingsComponent);
    fixture.detectChanges();
  });
});
