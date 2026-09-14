import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SseRefreshBtnComponent } from './sse-refresh-btn.component';

describe('SseRefreshBtnComponent', () => {
  let component: SseRefreshBtnComponent;
  let fixture: ComponentFixture<SseRefreshBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SseRefreshBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SseRefreshBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
