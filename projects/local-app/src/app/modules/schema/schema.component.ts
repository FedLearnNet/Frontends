import {Component, ViewEncapsulation} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrl: './schema.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet],
})
export class SchemaComponent {
}
