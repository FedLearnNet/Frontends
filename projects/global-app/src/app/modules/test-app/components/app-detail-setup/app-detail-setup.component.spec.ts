import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailSetupComponent } from './app-detail-setup.component';

describe('AppDetailSetupComponent', () => {
  let component: AppDetailSetupComponent;
  let fixture: ComponentFixture<AppDetailSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
