import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { buildGithubIssueUrl, CreateIssueDialogComponent, GITHUB_NEW_ISSUE_URL } from './create-issue-dialog.component';

describe('CreateIssueDialogComponent', () => {
  let component: CreateIssueDialogComponent;
  let fixture: ComponentFixture<CreateIssueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIssueDialogComponent],
      providers: [{provide: MatDialogRef, useValue: {close: () => undefined}}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateIssueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds a prefilled GitHub issue URL', () => {
    const url = new URL(buildGithubIssueUrl('Upload fails', 'Steps to reproduce', 'FLNet-Client'));

    expect(`${url.origin}${url.pathname}`).toBe(GITHUB_NEW_ISSUE_URL);
    expect(url.searchParams.get('title')).toBe('Upload fails');
    expect(url.searchParams.get('body')).toBe('Steps to reproduce\n\n---\nReported from FLNet-Client');
  });

  it('cuts long descriptions so GitHub accepts the URL', () => {
    const body = new URL(buildGithubIssueUrl('t', 'x'.repeat(20000), 'App')).searchParams.get('body')!;

    expect(body.length).toBeLessThanOrEqual(6000);
    expect(body.endsWith('Reported from App')).toBeTrue();
  });
});
