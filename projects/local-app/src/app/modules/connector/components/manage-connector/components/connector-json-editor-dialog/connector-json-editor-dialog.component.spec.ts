import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorJsonEditorDialogComponent } from './connector-json-editor-dialog.component';

describe('ConnectorJsonEditorDialogComponent', () => {
  let component: ConnectorJsonEditorDialogComponent;
  let fixture: ComponentFixture<ConnectorJsonEditorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorJsonEditorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorJsonEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
