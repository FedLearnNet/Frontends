import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigOutputComponent } from './app-detail-config-output.component';

describe('AppDetailConfigOutputComponent', () => {
  let component: AppDetailConfigOutputComponent;
  let fixture: ComponentFixture<AppDetailConfigOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigOutputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
