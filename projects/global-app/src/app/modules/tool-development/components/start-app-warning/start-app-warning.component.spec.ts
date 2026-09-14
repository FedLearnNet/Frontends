import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAppWarningComponent } from './start-app-warning.component';

describe('StartAppWarningComponent', () => {
  let component: StartAppWarningComponent;
  let fixture: ComponentFixture<StartAppWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAppWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAppWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
