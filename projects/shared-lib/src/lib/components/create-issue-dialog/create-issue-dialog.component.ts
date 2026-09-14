import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {GitlabCreateIssueDTO} from "@shared-lib/components/create-issue-dialog/gitliab-issue.dto";
import {GitlabIssueService} from "@shared-lib/components/create-issue-dialog/gitlab-issue.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'lib-create-issue-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,],
  templateUrl: './create-issue-dialog.component.html',
  styleUrl: './create-issue-dialog.component.scss',
})
export class CreateIssueDialogComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateIssueDialogComponent>);
  private readonly gitlabIssueService = inject(GitlabIssueService);

  loading = signal(false);
  errors = signal<string[]>([]);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const raw = this.form.getRawValue();

    const errorBlock = this.buildErrorBlock();
    const finalDescription = errorBlock
      ? raw.description + '\n\n--- Previous errors ---\n' + errorBlock
      : raw.description;

    const payload: GitlabCreateIssueDTO = {
      title: raw.title,
      description: finalDescription,
    };

    this.loading.set(true);

    this.gitlabIssueService.createIssue(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = this.extractErrorMessage(err);
        this.errors.update(prev => [...prev, msg]);
      },
    });
  }

  private buildErrorBlock(): string | null {
    const list = this.errors();
    if (!list.length) return null;
    return list.map((e, i) => `${i + 1}. ${e}`).join('\n');
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (typeof err.error === 'string') return err.error;

    if (err.error && typeof err.error === 'object' && 'message' in err.error) {
      return err.error.message;
    }
    return `HTTP ${err.status} – ${err.statusText || 'Unknown error'}`;
  }
}
