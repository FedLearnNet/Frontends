import { Component, OnInit } from '@angular/core';
import { environment } from '@global-app/env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'global-app';

  menuItems = [
    {
      title: 'Find Data',
      link: '/find-data',
    },
    {
      title: 'Model Store',
      link: '/model-store',
    },
    {
      title: 'App Store',
      link: '/app-store',
    },
    {
      title: 'Data Modelling',
      link: '/data-modelling',
    },
    {
      title: 'Model',
      link: '/model',
    },
    {
      title: 'Predictions',
      link: '/predictions',
    },
    {
      title: 'Project',
      link: '/project',
    },
    {
      title: 'App Development',
      link: '/app',
    },
  ];


  ngOnInit() {
    document.title = environment.appTitle;

    if(!environment.allowGlobalDataModeling) {
      this.menuItems = this.menuItems.filter(item => item.link !== '/data-modelling')
        .filter(item => item.link !== '/find-data');
    }
  }
}
