import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFileDialogComponent } from './select-file-dialog.component';

describe('SelectFileDialogComponent', () => {
  let component: SelectFileDialogComponent;
  let fixture: ComponentFixture<SelectFileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFileDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
