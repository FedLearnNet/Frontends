import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('text', 'ready');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an empty label when runtime data is undefined', () => {
    fixture.componentRef.setInput('text', undefined);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.formattedText()).toBe('');
  });
});
