import { Component } from '@angular/core';
import { environment } from '@global-app/env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'global-app';

  menuItems = [
    {
      title: 'Find Data/Train a model',
      link: '/find-data',
    },
    {
      title: 'Model Store',
      link: '/model-store',
    },
  ];

  ngOnInit() {
    document.title = `Microb·AI·ome - ${environment.appTitle}`
  }
}
