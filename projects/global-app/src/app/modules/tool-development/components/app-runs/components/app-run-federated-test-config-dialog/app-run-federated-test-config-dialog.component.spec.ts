import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunFederatedTestConfigDialogComponent } from './app-run-federated-test-config-dialog.component';

describe('AppRunFederatedTestConfigDialogComponent', () => {
  let component: AppRunFederatedTestConfigDialogComponent;
  let fixture: ComponentFixture<AppRunFederatedTestConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunFederatedTestConfigDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunFederatedTestConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
