import { Component, OnInit } from '@angular/core';
import { environment } from '@local-app/env/environment';

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
      title: 'Privacy/Data Review',
      link: '/data-review',
    },
  ];

  ngOnInit() {
    document.title = `Microb·AI·ome - ${environment.appTitle}`
  }
}
