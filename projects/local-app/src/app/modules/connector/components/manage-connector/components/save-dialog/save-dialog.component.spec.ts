import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageConnectorSaveDialogComponent } from './save-dialog.component';

describe('SaveDialogComponent', () => {
  let component: ManageConnectorSaveDialogComponent;
  let fixture: ComponentFixture<ManageConnectorSaveDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageConnectorSaveDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageConnectorSaveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
