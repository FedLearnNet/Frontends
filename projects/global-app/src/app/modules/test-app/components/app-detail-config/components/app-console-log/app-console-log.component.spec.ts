import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConsoleLogComponent } from './app-console-log.component';

describe('AppConsoleLogComponent', () => {
  let component: AppConsoleLogComponent;
  let fixture: ComponentFixture<AppConsoleLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppConsoleLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppConsoleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
