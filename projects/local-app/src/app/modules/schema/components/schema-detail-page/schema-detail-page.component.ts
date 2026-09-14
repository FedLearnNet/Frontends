import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SchemaDetailComponent} from '@local-app/cohort/components/schema-detail/schema-detail.component';
import {SchemaRootNodeDto} from '@local-app/cohort/dto/schema';

@Component({
  selector: 'app-schema-detail-page',
  templateUrl: './schema-detail-page.component.html',
  styleUrl: './schema-detail-page.component.scss',
  imports: [SchemaDetailComponent],
})
export class SchemaDetailPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly schema = signal<SchemaRootNodeDto | undefined>(undefined);

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed())
      .subscribe(({schema}) => this.schema.set(schema));
  }
}
