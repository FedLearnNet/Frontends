import {Component, input, ChangeDetectionStrategy} from '@angular/core';

/** One shimmering text line as placeholder while a short value loads, e.g. inline in a sentence. */
@Component({
  selector: 'lib-skeleton-line',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './skeleton-line.component.scss',
  host: {
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
})
export class SkeletonLineComponent {
  width = input<string>('100%');
  height = input<string>('1em');
}
