import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunTestComponent } from './app-run-test.component';

describe('AppRunTestComponent', () => {
  let component: AppRunTestComponent;
  let fixture: ComponentFixture<AppRunTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
