import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Input() menuItems: any;
}
