import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MarkdownDialogComponent} from '@shared-lib/components/markdown-dialog/markdown-dialog.component';

@Component({
  selector: 'lib-run-execution-help',
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `<button mat-icon-button type="button" aria-label="How test runs work"
    matTooltip="How test runs work" (click)="open()"><mat-icon>info_outline</mat-icon></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunExecutionHelpComponent {
  readonly federated = input(false);
  private readonly dialog = inject(MatDialog);

  open(): void {
    this.dialog.open(MarkdownDialogComponent, {
      width: '720px', maxWidth: '96vw', maxHeight: '90vh', autoFocus: false,
      data: {title: 'How test runs work', copyToClipboard: false, markdown: `
## 1. Choose where to run

**Start new ${this.federated() ? 'containers' : 'container'}** uses this tool's built image. ${this.federated()
  ? 'Each training client gets its own container. A separate aggregator adds one more; placing it with a client uses that client’s container.'
  : 'One temporary container runs this test, independently of any engine already connected.'}

**Use connected engine** sends the test to the engine already connected to this tool. ${this.federated()
  ? 'All configured participants run inside that one engine. No new participant containers are created.'
  : 'No new container is created.'} If this option is disabled, connect an engine from the tool header first.

## 2. Configure, then start

${this.federated() ? 'Choose training data for each client. The aggregator combines their model updates; a separate aggregator does not need training data.' : 'Choose the input data and parameters for this test.'} Local file paths refer to the connected engine’s data directory.

Opening a card or editing settings does **not** start a run. Click **Start run** when the setup is ready.

## 3. What happens afterward?

- Containers started specifically for this run are removed when it finishes, fails, or is stopped.
- An engine that was connected before the run **stays running**. Its container is not removed by this test.
- Run details and saved results remain available in the run history. Files in **My Files** are not deleted by container cleanup.

## Other built-image actions

**Self-test** generates its own input to check the built image. **Use as engine** starts a persistent engine for repeated tests; you stop that engine explicitly.
`},
    });
  }
}
