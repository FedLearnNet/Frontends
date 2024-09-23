import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorRunDialogComponent } from './run-dialog.component';

describe('ConnectorRunDialogComponent', () => {
  let component: ConnectorRunDialogComponent;
  let fixture: ComponentFixture<ConnectorRunDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorRunDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorRunDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
