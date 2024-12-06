import { Component, Input } from '@angular/core';
import { environment } from '@shared-lib/env/environment';

@Component({
  selector: 'app-lib-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  project = environment.project;

  @Input() menuItems: any;
}
