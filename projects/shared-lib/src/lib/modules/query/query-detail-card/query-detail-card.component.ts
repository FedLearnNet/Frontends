import {Component, computed, input} from '@angular/core';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatCard} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";
import {EnhancedQueryItemDTO, QueryDTO, QueryDetailDTO, QueryItemDTO} from "@global-app/find-data/dto/query";
import {parseValue, prettifyOperator} from "../../../../../../local-app/src/app/modules/logs/helper/query.helper";

type QueryCardDto = LocalQueryDto | QueryDTO | QueryDetailDTO;
type QueryCardItem = LocalQueryDto['enhancedQuery'][number] | EnhancedQueryItemDTO | QueryItemDTO;

@Component({
  selector: 'lib-query-detail-card',
  imports: [
    BadgeComponent,
    MatCard,
    MatIcon,
    MatTooltip,
    StatusBadgeComponent,
    TimeBadgeComponent
  ],
  templateUrl: './query-detail-card.component.html',
  styleUrl: './query-detail-card.component.scss',
})
export class QueryDetailCardComponent {
  query = input.required<QueryCardDto>();

  readonly items = computed<QueryCardItem[]>(() => {
    const query = this.query();
    if ('enhancedQuery' in query && query.enhancedQuery?.length) {
      return query.enhancedQuery;
    }
    return query.query ?? [];
  });

  readonly statusText = computed(() => {
    const query = this.query();
    return this.isLocalQuery(query) ? query.status : null;
  });

  readonly statusMessage = computed(() => {
    const query = this.query();
    return this.isLocalQuery(query) ? query.statusMessage : null;
  });

  readonly isSuccess = computed(() => (this.statusText() ?? '').toLowerCase() === "completed");
  readonly showCreatedAtFooter = computed(() => !this.isLocalQuery(this.query()));

  prettify(op: any) {
    return prettifyOperator(op);
  }

  prettyValue(val?: any) {
    return parseValue(val);
  }

  getGroupLabels(group: QueryCardItem): string[] {
    if ('schemaNodes' in group && group.schemaNodes?.length) {
      return group.schemaNodes.map(node => node.name);
    }

    const ontologyName = this.cleanText('ontologyName' in group ? group.ontologyName : undefined);
    const dataTypeId = this.cleanText(group.dataTypeId);
    const ontologyId = this.cleanText(group.ontologyId);
    const label = [ontologyName, dataTypeId].filter(Boolean).join(' / ');

    if (label) {
      return [label];
    }

    return ontologyId ? [ontologyId] : [];
  }

  private isLocalQuery(query: QueryCardDto): query is LocalQueryDto {
    return 'status' in query;
  }

  private cleanText(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
