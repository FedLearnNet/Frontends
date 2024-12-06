import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EMPTY, map, Observable} from "rxjs";
import {ProjectDetailDto, ProjectDto} from "../../dto/project";

@Component({
  selector: 'app-detail-project',
  templateUrl: './detail-project.component.html',
  styleUrl: './detail-project.component.scss',
})
export class DetailProjectComponent implements OnInit {

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  public selectedIndex: number = 0;

  public project?: ProjectDetailDto;

  ngOnInit(): void {

   this.activatedRoute.data.pipe(
      map(data => data['project']
      )).subscribe(project => {
      this.project = project;
    })

    this.activatedRoute.fragment.subscribe(fragment => {
      const tabIndex = this.getTabIndexFromHash(fragment);
      if (tabIndex !== -1) {
        this.selectedIndex = tabIndex;
      }
    });
  }

  onTabChange(event: any): void {
    const selectedTabLabel = event.tab.textLabel;
    this.router.navigate([], {
      fragment: selectedTabLabel.toLowerCase(),
    });
  }

  getTabIndexFromHash(hash: string | null): number {
    switch (hash) {
      case 'overview':
        return 0;
      case 'data':
        return 1;
      case 'workflow':
        return 2;
      case 'run':
        return 3;
      case 'bootstrap':
        return 4;
      default:
        return 0;
    }
  }

}
