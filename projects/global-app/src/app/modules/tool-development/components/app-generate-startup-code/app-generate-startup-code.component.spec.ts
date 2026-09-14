import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppGenerateStartupCodeComponent } from './app-generate-startup-code.component';

describe('AppGenerateStartupCodeComponent', () => {
  let component: AppGenerateStartupCodeComponent;
  let fixture: ComponentFixture<AppGenerateStartupCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppGenerateStartupCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppGenerateStartupCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
