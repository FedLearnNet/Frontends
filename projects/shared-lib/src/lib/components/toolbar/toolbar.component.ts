import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lib-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Input() menuItems: any;

  ICON="../../../assets/images/Logo%20Microb-AI-ome/Logo%20Microb-AI-ome/2%20Horizontal%20Version/Microb-AI-ome_Logo_white.png";
}
