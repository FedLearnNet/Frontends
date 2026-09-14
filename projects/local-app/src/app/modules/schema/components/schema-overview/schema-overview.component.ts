import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {SchemaRootNodeDto} from '@local-app/cohort/dto/schema';

@Component({
  selector: 'app-schema-overview',
  templateUrl: './schema-overview.component.html',
  styleUrl: './schema-overview.component.scss',
  imports: [MatTableModule, MatIconModule, RouterLink, TranslatePipe, HeaderComponent, PageWrapperComponent],
})
export class SchemaOverviewComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly schemas = signal<SchemaRootNodeDto[]>([]);
  readonly displayedColumns = ['name', 'description', 'version'];

  ngOnInit(): void {
    this.route.data.subscribe(({schemas}) => this.schemas.set(schemas ?? []));
  }
}
