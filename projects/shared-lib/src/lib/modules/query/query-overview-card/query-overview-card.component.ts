import {Component, computed, input, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe, UpperCasePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";
import {
  EnhancedQueryItemDTO,
  QueryDetailDTO,
  QueryItemDTO,
  QueryOperatorDTO,
  QueryOperatorTypes
} from "@global-app/find-data/dto/query";
import {isLang2Group} from "@global-app/find-data/dto/lang2-query";
import {formatLang2Query} from "@global-app/find-data/helpers/query-tree.serializer";
import {parseValue, prettifyOperator} from "../../../../../../local-app/src/app/modules/logs/helper/query.helper";

type QueryCardDto = LocalQueryDto | QueryDetailDTO;
type QueryCardItem = LocalQueryDto['enhancedQuery'][number] | EnhancedQueryItemDTO | QueryItemDTO;
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
    if (query.enhancedQuery?.length || Array.isArray(query.query) || !isLang2Group(query.query)) {
      return null;
    }
    return formatLang2Query(query.query, leaf =>
      [leaf.ontology_id, leaf.data_type_id].filter(Boolean).join(' / ')
    );
  });

  readonly items = computed<QueryCardItem[]>(() => {
    const query = this.query();
    if (query.enhancedQuery?.length) {
      return query.enhancedQuery;
    }
    return Array.isArray(query.query) ? query.query : [];
  });

  readonly groups = computed<QueryGroup[]>(() => this.items().map(g => {
    const labels = this.getGroupLabels(g);
    return {
      labels: labels.length ? labels : [''],
      conditions: (g.operator ?? []).map(op => this.toCondition(op)),
    };
  }));

  private toCondition(op: QueryOperatorDTO): QueryCondition {
    const norm = op.operator as QueryOperatorTypes | string;
    const isExists = norm === QueryOperatorTypes.EXISTS || norm === 'exists';
    return {operator: prettifyOperator(norm), value: isExists ? '' : parseValue(op.value)};
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
