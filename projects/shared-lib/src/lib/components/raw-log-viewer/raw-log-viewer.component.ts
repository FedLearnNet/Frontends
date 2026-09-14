import {Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'lib-raw-log-viewer',
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './raw-log-viewer.component.html',
  styleUrl: './raw-log-viewer.component.scss',
})
export class RawLogViewerComponent {
  readonly rawLogs = input<string>();

  logsLines = computed(() => {
    const logs = this.rawLogs();
    if (logs && logs.length > 0) {
      return logs.split("\n")
        .filter(line => line.trim().length > 0)
    }
    return [];
  });

  protected downloadLogs(): void {
    const logs = this.rawLogs();
    if (!logs) return;

    const blob = new Blob([logs], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  protected copyLogs(): void {
    const logs = this.rawLogs();
    if (!logs) return;

    navigator.clipboard.writeText(logs).then(() => {
      // Optional: Show a success message to the user, e.g., with MatSnackBar
      console.log('Logs copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy logs: ', err);
    });
  }

}
