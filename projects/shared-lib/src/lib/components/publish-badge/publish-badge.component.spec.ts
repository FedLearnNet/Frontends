import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishBadgeComponent } from './publish-badge.component';

describe('PublishBadgeComponent', () => {
  let _component: PublishBadgeComponent;
  let fixture: ComponentFixture<PublishBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishBadgeComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
