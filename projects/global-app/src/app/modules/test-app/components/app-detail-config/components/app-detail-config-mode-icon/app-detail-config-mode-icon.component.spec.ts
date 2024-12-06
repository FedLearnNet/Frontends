import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigModeIconComponent } from './app-detail-config-mode-icon.component';

describe('AppDetailConfigModeIconComponent', () => {
  let component: AppDetailConfigModeIconComponent;
  let fixture: ComponentFixture<AppDetailConfigModeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigModeIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigModeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
