import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'lib-info-item',
  imports: [],
  templateUrl: './info-item.component.html',
  styleUrl: './info-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoItemComponent {
  title = input.required<string>();
}
