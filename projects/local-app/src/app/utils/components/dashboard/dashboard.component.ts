import { Component } from '@angular/core';
import { environment } from '@local-app/env/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  project = environment.project;
  appTitle: string = environment.appTitle;
}
