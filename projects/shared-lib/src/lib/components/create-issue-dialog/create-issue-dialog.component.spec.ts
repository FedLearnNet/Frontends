import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIssueDialogComponent } from './create-issue-dialog.component';

describe('CreateIssureDialogComponent', () => {
  let component: CreateIssueDialogComponent;
  let fixture: ComponentFixture<CreateIssueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIssueDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateIssueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
