import {Component, computed, input, ChangeDetectionStrategy} from '@angular/core';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MatCard} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";
import {EnhancedQueryItemDTO, QueryDTO, QueryDetailDTO} from "@global-app/find-data/dto/query";
import {IntervalPartDTO, isQueryGroup, QueryGroupDTO, TemporalRelationDTO} from "@global-app/find-data/dto/query-item";
import {NgTemplateOutlet} from "@angular/common";
import {parseValue, prettifyOperator} from "../../../../../../local-app/src/app/modules/logs/helper/query.helper";

type QueryCardDto = LocalQueryDto | QueryDTO | QueryDetailDTO;
type QueryCardItem = LocalQueryDto['enhancedQuery'][number] | EnhancedQueryItemDTO;

@Component({
  selector: 'lib-query-detail-card',
  imports: [
    BadgeComponent,
    MatCard,
    MatIcon,
    MatTooltip,
    StatusBadgeComponent,
    TimeBadgeComponent,
    TranslatePipe,
    NgTemplateOutlet
  ],
  templateUrl: './query-detail-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './query-detail-card.component.scss',
})
export class QueryDetailCardComponent {
  query = input.required<QueryCardDto>();

  readonly items = computed<QueryCardItem[]>(() => {
    const query = this.query();
    if ('enhancedQuery' in query && query.enhancedQuery?.length) {
      return query.enhancedQuery;
    }
    return [];
  });

  readonly queryTree = computed<QueryGroupDTO | null>(() => {
    const query = this.query();
    if ('enhancedQuery' in query && query.enhancedQuery?.length) {
      return null;
    }
    return isQueryGroup(query.query) ? query.query : null;
  });

  readonly rootOperator = computed(() => {
    const query = this.query().query;
    return isQueryGroup(query) ? query.connectingOperator : 'AND';
  });

  readonly isGroup = isQueryGroup;

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

  hasValue(value?: string | number | null): boolean {
    return value !== undefined && value !== null && value !== '';
  }

  relationLabel(relation: TemporalRelationDTO): string {
    const phrase = relation.relationship.toLowerCase().replace(/_/g, ' ');
    const interval = this.intervalLabel(relation.interval);
    return interval ? `${phrase} ${interval}` : phrase;
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

  private intervalLabel(parts?: IntervalPartDTO[]): string {
    return (parts ?? []).map(part => `${part.count} ${part.unit.toLowerCase()}`).join(' ');
  }

  private isLocalQuery(query: QueryCardDto): query is LocalQueryDto {
    return 'status' in query;
  }

  private cleanText(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
