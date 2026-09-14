import {ChangeDetectionStrategy, Component, effect, inject, input, signal} from '@angular/core';

import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {MatLineModule} from "@angular/material/core";
import {TranslatePipe} from "@ngx-translate/core";
import {LogService} from "../../../logs/services/log-service";
import {SchemaService} from "@local-app/cohort/services/schema.service";
import {SchemaNodeDto} from "@local-app/cohort/dto/schema";
import {LocalQueryDto} from "../../../logs/dto/query";
import {NgClass} from "@angular/common";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {ProjectDetailDto} from "@global-app/project/dto/project";
import {QueryDetailCardComponent} from "@shared-lib/modules/query/query-detail-card/query-detail-card.component";

@Component({
  selector: 'app-training-used-data',
  templateUrl: './training-used-data.component.html',
  styleUrl: './training-used-data.component.scss',
  imports: [
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatLineModule,
    TranslatePipe,
    NgClass,
    InfoGridComponent,
    InfoItemComponent,
    QueryDetailCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TrainingUsedDataComponent {
  private readonly logService: LogService = inject(LogService);
  private readonly schemaService: SchemaService = inject(SchemaService);

  readonly flProject = input.required<ProjectDetailDto>();

  readonly query = signal<LocalQueryDto | undefined>(undefined);
  readonly schemas = signal<SchemaNodeDto[]>([]);

  constructor() {
    effect(() => {
      const project = this.flProject();
      if (!project) return;

      const queryId = project.queryId;
      this.logService.getQueryInfo(queryId).subscribe(value => this.query.set(value));
      this.schemaService.getSchemasForProject(project.id).subscribe(value => this.schemas.set(value));
    });
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}
