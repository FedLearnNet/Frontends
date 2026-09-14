import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-kv',
  templateUrl: './kv.component.html',
  styleUrl: './kv.component.scss',
})
export class KvComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>(undefined);
  readonly mono = input<boolean>(false);
  readonly multiline = input<boolean>(false);
  readonly border = input<boolean>(true);
}
