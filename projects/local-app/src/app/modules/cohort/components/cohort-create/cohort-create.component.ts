import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  CohortCreateDialogComponent
} from '@local-app/cohort/components/cohort-create-dialog/cohort-create-dialog.component';
import {
  ExternalDatabaseFormComponent
} from '@local-app/cohort/components/external-database-form/external-database-form.component';
import {SchemaRootNodeDto} from '@local-app/cohort/dto/schema';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';

type CohortSource = 'schema' | 'external';

interface SourceOption {
  value: CohortSource;
  icon: string;
  title: string;
  text: string;
  tags: string[];
}

// A new cohort, either on a harmonized schema filled by ETL or on an external database for TRE.
@Component({
  selector: 'app-cohort-create',
  templateUrl: './cohort-create.component.html',
  styleUrl: './cohort-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, HeaderComponent, PageWrapperComponent,
    ExternalDatabaseFormComponent],
})
export class CohortCreateComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly sources: SourceOption[] = [
    {
      value: 'schema', icon: 'account_tree', title: 'Harmonized schema',
      text: 'Map your data to a schema of the platform and import it with a connector.',
      tags: ['Queries', 'Federated learning', 'TRE', 'Statistics'],
    },
    {
      value: 'external', icon: 'storage', title: 'External database',
      text: 'Link a database you already run, such as Neo4j or PostgreSQL. Nothing is imported.',
      tags: ['TRE only'],
    },
  ];

  readonly schemas = toSignal(this.route.data.pipe(map(data => (data['schemaHeadList'] ?? []) as SchemaRootNodeDto[])),
    {initialValue: []});
  // kept in the URL, so the choice survives a reload and can be linked
  readonly source = toSignal(this.route.queryParamMap.pipe(
    map(params => (params.get('source') === 'external' ? 'external' : 'schema') as CohortSource)), {initialValue: 'schema'});
  readonly search = signal('');
  readonly filteredSchemas = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.schemas()
      .filter(schema => !query || `${schema.name} ${schema.description ?? ''}`.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  selectSource(source: CohortSource): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {source: source === 'external' ? source : null},
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openSchema(schema: SchemaRootNodeDto): void {
    this.dialog.open(CohortCreateDialogComponent, {
      width: '90vw',
      maxWidth: '1280px',
      autoFocus: false,
      data: {schemaId: schema.globalId},
    });
  }
}
