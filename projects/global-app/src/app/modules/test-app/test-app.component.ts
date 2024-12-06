import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-test-app',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './test-app.component.html',
  styleUrl: './test-app.component.scss'
})
export class TestAppComponent {

}
