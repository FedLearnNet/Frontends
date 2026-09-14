import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorImportDialogComponent } from './connector-import-dialog.component';

describe('ConnectorImportDialogComponent', () => {
  let component: ConnectorImportDialogComponent;
  let fixture: ComponentFixture<ConnectorImportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorImportDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
