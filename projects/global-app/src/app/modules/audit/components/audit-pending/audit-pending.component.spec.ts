import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditPendingComponent } from './audit-pending.component';

describe('AuditPendingComponent', () => {
  let component: AuditPendingComponent;
  let fixture: ComponentFixture<AuditPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditPendingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
