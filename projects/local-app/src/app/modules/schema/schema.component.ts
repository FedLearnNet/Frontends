import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrl: './schema.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet],
})
export class SchemaComponent {
}
