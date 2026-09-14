import {Component, input} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-user-link',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink
],
  templateUrl: './user-link.component.html',
  styleUrl: './user-link.component.scss'
})
export class UserLinkComponent {
  readonly id = input<number>();
  readonly name = input<string>();
}
