import {AfterViewInit, Component, computed, inject, input, OnInit, signal, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {RouterLink} from "@angular/router";
import {ModelDto} from "@shared-lib/modules/app-execution/dto/model";

import {TranslatePipe} from '@ngx-translate/core';
import {Store} from "@ngrx/store";
import {loadMyModels} from "@shared-lib/modules/app-execution/store/model/model.actions";
import {selectMyModels} from "@shared-lib/modules/app-execution/store/model/model.selectors";
import {PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

@Component({
  selector: 'app-my-model-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    RouterLink,
    TranslatePipe,
    PublishBadgeComponent,
    HeaderComponent,
  ],
  templateUrl: './my-model-list.component.html',
  styleUrl: './my-model-list.component.scss'
})
export class MyModelListComponent implements OnInit, AfterViewInit {
  private readonly store: Store = inject(Store);
  forAppId = input<number>();
  forExperimentId = input<number>();
  forFederatedExperimentId = input<number>();

  filtered = computed(() => !!this.forAppId() || !!this.forExperimentId() || !!this.forFederatedExperimentId());
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'publishStatus', 'shortDescription', 'appId', 'appName'];
  dataSource: MatTableDataSource<ModelDto> = new MatTableDataSource();

  models$ = this.store.select(selectMyModels);
  latestSearchValue = signal<string>('')

  ngOnInit() {
    this.models$.subscribe((models) => {
      this.dataSource.data = models;
    });

    if (this.filtered()) {
      this.store.dispatch(loadMyModels({
        appId: this.forAppId(),
        federatedExperimentId: this.forFederatedExperimentId(),
        experimentId: this.forExperimentId()
      }));
      this.displayedColumns = ['id', 'name', 'publishStatus', 'shortDescription'];
    } else {
      this.store.dispatch(loadMyModels({}));
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.latestSearchValue.set(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
