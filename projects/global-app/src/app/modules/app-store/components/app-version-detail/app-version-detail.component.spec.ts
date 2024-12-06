import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVersionDetailComponent } from './app-version-detail.component';

describe('AppVersionDetailComponent', () => {
  let component: AppVersionDetailComponent;
  let fixture: ComponentFixture<AppVersionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppVersionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppVersionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
