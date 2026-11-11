import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {environment} from "@shared-lib/env/environment";

/** Public issue tracker; the user submits the prefilled issue with their own GitHub account, no token needed. */
export const GITHUB_NEW_ISSUE_URL = 'https://github.com/FedLearnNet/.github/issues/new';

// GitHub rejects very long URLs, so the body is cut well below the ~8k limit
const MAX_BODY_LENGTH = 6000;

export const buildGithubIssueUrl = (title: string, description: string, appTitle: string): string => {
  const footer = `\n\n---\nReported from ${appTitle}`;
  const body = description.length + footer.length > MAX_BODY_LENGTH
    ? description.slice(0, MAX_BODY_LENGTH - footer.length - 1) + '…' + footer
    : description + footer;
  const params = new URLSearchParams({title, body});
  return `${GITHUB_NEW_ISSUE_URL}?${params.toString()}`;
};

@Component({
  selector: 'lib-create-issue-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,],
  templateUrl: './create-issue-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create-issue-dialog.component.scss',
})
export class CreateIssueDialogComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateIssueDialogComponent>);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  cancel(): void {
    this.dialogRef.close(false);
  }

  /** Opens the prefilled GitHub issue in a new tab, where the user reviews and submits it. */
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    window.open(buildGithubIssueUrl(raw.title, raw.description, environment.appTitle), '_blank', 'noopener');
    this.dialogRef.close(true);
  }
}
