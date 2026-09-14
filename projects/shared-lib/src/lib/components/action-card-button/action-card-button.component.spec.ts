import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCardButtonComponent } from './action-card-button.component';

describe('ActionCardButtonComponent', () => {
  let component: ActionCardButtonComponent;
  let fixture: ComponentFixture<ActionCardButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionCardButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionCardButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
