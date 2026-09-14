import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorStepCardsComponent } from './cards.component';

describe('ConnectorStepCardsComponent', () => {
  let component: ConnectorStepCardsComponent;
  let fixture: ComponentFixture<ConnectorStepCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorStepCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorStepCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
