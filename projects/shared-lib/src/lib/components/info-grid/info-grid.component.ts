import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'lib-info-grid',
  imports: [],
  templateUrl: './info-grid.component.html',
  styleUrl: './info-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoGridComponent {
  title = input.required<string>();

  disableFlex = input<boolean>(false);
}
