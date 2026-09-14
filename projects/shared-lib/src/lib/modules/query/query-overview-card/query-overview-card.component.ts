import {Component, computed, input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";
import {
  EnhancedQueryItemDTO,
  QueryDetailDTO,
  QueryItemDTO,
  QueryOperatorDTO,
  QueryOperatorTypes
} from "@global-app/find-data/dto/query";
import {parseValue, prettifyOperator} from "../../../../../../local-app/src/app/modules/logs/helper/query.helper";

type QueryCardDto = LocalQueryDto | QueryDetailDTO;
type QueryCardItem = LocalQueryDto['enhancedQuery'][number] | EnhancedQueryItemDTO | QueryItemDTO;

@Component({
  selector: 'lib-query-overview-card',
  imports: [
    DatePipe
  ],
  templateUrl: './query-overview-card.component.html',
  styleUrl: './query-overview-card.component.scss',
})
export class QueryOverviewCardComponent {
  query = input.required<QueryCardDto>();
  id = input<number>();

  readonly items = computed<QueryCardItem[]>(() => {
    const query = this.query();
    if (query.enhancedQuery?.length) {
      return query.enhancedQuery;
    }
    return query.query ?? [];
  });

  readonly queryString = computed(() => {
    const groups = this.items();
    if (!groups.length) return '—';

    const groupStrings = groups.map(g => {
      const nodes = this.getGroupLabels(g);
      const ops = (g.operator ?? []).map(this.formatCondition);

      if (!nodes.length) return ops.length ? `(${ops.join(' AND ')})` : '(—)';

      const perNode = nodes.map(nodeLabel => {
        const body = ops.length ? ops.join(' AND ') : '—';
        return `${nodeLabel}: ${body}`;
      });
      return '(' + perNode.join(' OR ') + ')';
    });

    return groupStrings.join(' AND ');
  });

  public formatCondition(op: QueryOperatorDTO): string {
    const norm = op.operator as QueryOperatorTypes | string;
    if (norm === QueryOperatorTypes.EXISTS || norm === 'exists') {
      return prettifyOperator(norm);
    }
    return `${prettifyOperator(norm)} ${parseValue(op.value)}`.trim();
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
