import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTypeBadgeComponent } from './app-type-badge.component';

describe('AppTypeBadgeComponent', () => {
  let component: AppTypeBadgeComponent;
  let fixture: ComponentFixture<AppTypeBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTypeBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTypeBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
