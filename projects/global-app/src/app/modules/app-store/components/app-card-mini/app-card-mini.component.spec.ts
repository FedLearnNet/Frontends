import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCardMiniComponent } from './app-card-mini.component';

describe('AppCardMiniComponent', () => {
  let component: AppCardMiniComponent;
  let fixture: ComponentFixture<AppCardMiniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCardMiniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppCardMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
