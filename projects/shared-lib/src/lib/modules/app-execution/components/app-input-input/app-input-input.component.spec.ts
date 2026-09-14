import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInputInputComponent } from './app-input-input.component';

describe('AppInputInputComponent', () => {
  let component: AppInputInputComponent;
  let fixture: ComponentFixture<AppInputInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppInputInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppInputInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
