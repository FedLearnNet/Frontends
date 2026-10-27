import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-query-json-preview',
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './query-json-preview.component.html',
  styleUrl: './query-json-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryJsonPreviewComponent {
  private readonly clipboard = inject(Clipboard);

  readonly body = input<unknown>(null);
  readonly copied = signal(false);
  readonly json = computed(() => JSON.stringify(this.body(), null, 2));

  copy(): void {
    if (this.clipboard.copy(this.json())) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
