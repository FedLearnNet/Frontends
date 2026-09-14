import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalysisChatHoverCardComponent } from './data-analysis-chat-hover-card.component';

describe('DataAnalysisChatHoverCardComponent', () => {
  let _component: DataAnalysisChatHoverCardComponent;
  let fixture: ComponentFixture<DataAnalysisChatHoverCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAnalysisChatHoverCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAnalysisChatHoverCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
