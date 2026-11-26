import {Component, computed, input, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe, UpperCasePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";
import {EnhancedQueryItemDTO, QueryDetailDTO} from "@global-app/find-data/dto/query";
import {isQueryGroup} from "@global-app/find-data/dto/query-item";
import {operatorHasValue} from "@global-app/find-data/helpers/query-tree.rules";
import {formatQueryGroup} from "@global-app/find-data/helpers/query-tree.serializer";
import {parseValue, prettifyOperator} from "../../../../../../local-app/src/app/modules/logs/helper/query.helper";

type QueryCardDto = LocalQueryDto | QueryDetailDTO;
type QueryCardItem = LocalQueryDto['enhancedQuery'][number] | EnhancedQueryItemDTO;
type QueryCondition = { operator: string; value: string };
type QueryGroup = { labels: string[]; conditions: QueryCondition[] };

@Component({
  selector: 'lib-query-overview-card',
  imports: [
    DatePipe,
    TranslatePipe,
    UpperCasePipe
  ],
  templateUrl: './query-overview-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './query-overview-card.component.scss',
})
export class QueryOverviewCardComponent {
  query = input.required<QueryCardDto>();
  id = input<number>();

  readonly summary = computed(() => {
    const query = this.query();
    if (query.enhancedQuery?.length || !isQueryGroup(query.query)) {
      return null;
    }
    return formatQueryGroup(query.query, leaf =>
      [leaf.ontologyId, leaf.dataTypeId].filter(Boolean).join(' / ')
    );
  });

  readonly items = computed<QueryCardItem[]>(() => {
    const query = this.query();
    return query.enhancedQuery ?? [];
  });

  readonly groups = computed<QueryGroup[]>(() => this.items().map(g => {
    const labels = this.getGroupLabels(g);
    return {
      labels: labels.length ? labels : [''],
      conditions: g.operator ? [this.toCondition(g)] : [],
    };
  }));

  private toCondition(item: QueryCardItem): QueryCondition {
    const value = operatorHasValue(item.operator) && item.value != null ? parseValue(`${item.value}`) : '';
    return {operator: prettifyOperator(item.operator), value};
  }

  private getGroupLabels(group: QueryCardItem): string[] {
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

  private cleanText(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
