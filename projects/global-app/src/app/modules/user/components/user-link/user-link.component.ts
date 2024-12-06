import {Component, Input} from '@angular/core';
import {MatAnchor, MatButtonModule} from "@angular/material/button";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {CommonModule} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-user-link',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './user-link.component.html',
  styleUrl: './user-link.component.scss'
})
export class UserLinkComponent {
  @Input() id: number;
  @Input() name: string;
}
