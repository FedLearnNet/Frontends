import {Component, OnInit} from '@angular/core';
import {environment} from '@local-app/env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'local-app';

  menuItems = [
    {
      title: 'Cohort',
      link: '/cohort',
    },
    {
      title: 'Permissions',
      link: '/data-review/permissions',
    },
    {
      title: 'Training Review',
      link: '/data-review/training',
    },
    {
      title: 'Logs',
      link: '/logs',
    },
  ];

  ngOnInit() {
    document.title = environment.appTitle;
  }
}
