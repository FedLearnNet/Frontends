import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailDialogComponent } from './file-detail-dialog.component';

describe('FileDetailDialogComponent', () => {
  let _component: FileDetailDialogComponent;
  let fixture: ComponentFixture<FileDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDetailDialogComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
