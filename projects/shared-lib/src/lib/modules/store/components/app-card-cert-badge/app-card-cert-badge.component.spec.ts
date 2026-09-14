import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCardCertBadgeComponent } from './app-card-cert-badge.component';

describe('AppCardCertBadgeComponent', () => {
  let component: AppCardCertBadgeComponent;
  let fixture: ComponentFixture<AppCardCertBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCardCertBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppCardCertBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
