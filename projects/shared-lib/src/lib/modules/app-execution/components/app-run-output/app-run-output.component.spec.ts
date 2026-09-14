import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunOutputComponent } from './app-run-output.component';

describe('AppRunOutputComponent', () => {
  let component: AppRunOutputComponent;
  let fixture: ComponentFixture<AppRunOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunOutputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
