import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-model-store',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './model-store.component.html',
  styleUrl: './model-store.component.scss',
})
export class ModelStoreComponent {

}
