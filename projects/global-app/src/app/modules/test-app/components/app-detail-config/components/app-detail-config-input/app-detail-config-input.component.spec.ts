import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigInputComponent } from './app-detail-config-input.component';

describe('AppDetailConfigInputComponent', () => {
  let component: AppDetailConfigInputComponent;
  let fixture: ComponentFixture<AppDetailConfigInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
