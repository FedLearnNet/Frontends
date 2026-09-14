import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorCreateChoiceDialogComponent } from './connector-create-choice-dialog.component';

describe('ConnectorCreateChoiceDialogComponent', () => {
  let component: ConnectorCreateChoiceDialogComponent;
  let fixture: ComponentFixture<ConnectorCreateChoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorCreateChoiceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorCreateChoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
