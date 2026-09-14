import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigElementComponent } from './app-detail-config-element.component';

describe('AppDetailConfigInputComponent', () => {
  let component: AppDetailConfigElementComponent;
  let fixture: ComponentFixture<AppDetailConfigElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
