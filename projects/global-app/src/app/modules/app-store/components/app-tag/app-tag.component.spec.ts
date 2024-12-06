import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTagComponent } from './app-tag.component';

describe('AppTagComponent', () => {
  let component: AppTagComponent;
  let fixture: ComponentFixture<AppTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
