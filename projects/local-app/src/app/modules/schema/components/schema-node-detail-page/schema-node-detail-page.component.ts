import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {SchemaNodeDetailComponent} from '@local-app/cohort/components/schema-node-detail/schema-node-detail.component';
import {SchemaNodeDto} from '@local-app/cohort/dto/schema';

@Component({
  selector: 'app-schema-node-detail-page',
  templateUrl: './schema-node-detail-page.component.html',
  styleUrl: './schema-node-detail-page.component.scss',
  imports: [HeaderComponent, PageWrapperComponent, SchemaNodeDetailComponent],
})
export class SchemaNodeDetailPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly node = signal<SchemaNodeDto | undefined>(undefined);

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed())
      .subscribe(({node}) => this.node.set(node));
  }
}
