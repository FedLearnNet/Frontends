import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UserPromptInputComponent} from './user-prompt-input.component';

describe('UserPromptInputComponent', () => {
  let fixture: ComponentFixture<UserPromptInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPromptInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserPromptInputComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
