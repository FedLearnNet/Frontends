import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {Store} from "@ngrx/store";
import {selectStoreError, selectStoreGraph, selectStoreLoading} from "@shared-lib/modules/store/store/store.selectors";
import {ToolGraphEdgeDTO, ToolGraphNodeDTO} from "@shared-lib/modules/store/dto/tool-graph";
import * as echarts from 'echarts/core';
import {ECharts} from 'echarts/core';
import {GraphChart} from 'echarts/charts';
import {LegendComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import {TranslatePipe} from "@ngx-translate/core";
import {ShortestPath} from "@shared-lib/modules/store/model/store-graph";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatDivider} from "@angular/material/list";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

echarts.use([GraphChart, LegendComponent, CanvasRenderer]);


@Component({
  selector: 'lib-store-graph-list',
  imports: [
    NgxEchartsDirective,
    TranslatePipe,
    StoreCardComponent,
    BadgeComponent,
    MatDivider,
    HeaderComponent,
    PageWrapperComponent,
  ],
  templateUrl: './store-graph-list.component.html',
  styleUrl: './store-graph-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({echarts})],
})
export class StoreGraphListComponent {
  private readonly store: Store = inject(Store);

  readonly shortestPath = input<ShortestPath | undefined>(undefined);
  readonly hideToolbar = input<boolean>(false);

  public graph = this.store.selectSignal(selectStoreGraph);
  public readonly isLoading = this.store.selectSignal(selectStoreLoading);
  public readonly error = this.store.selectSignal(selectStoreError);

  readonly showLabels = signal(true);
  readonly useForce = signal(false);
  readonly showEdgeDetails = signal(true);

  readonly graphSubtitle = computed(() => {
    const g = this.graph();
    if (!g) return '';
    return `${g.nodes.length} Tools · ${g.edges.length} connections`;
  });

  readonly selectedEdge = signal<ToolGraphEdgeDTO | null>(null);
  readonly hoveredEdge = signal<ToolGraphEdgeDTO | null>(null);
  readonly hoveredNode = signal<AppDetailDto | null>(null);
  readonly hoverPos = signal<{ x: number; y: number } | null>(null);

  readonly nodeById = computed(() => {
    const map = new Map<number, ToolGraphNodeDTO>();
    const g = this.graph();
    for (const n of (g?.nodes ?? [])) map.set(n.app.id, n);
    return map;
  });
  nodeName = (id: number) => this.nodeById().get(id)?.app?.name ?? `${id}`;

  private readonly echartsInstance = signal<ECharts | undefined>(undefined);


  private readonly highlight = computed(() => {
    const shortestPath = this.shortestPath();
    const p = shortestPath?.path;
    if (!p?.edges?.length) {
      return {nodeIds: new Set<string>(), edgeKeys: new Set<string>()};
    }

    const nodeIds = new Set<string>();
    nodeIds.add(String(p.fromAppId));
    for (const e of p.edges) {
      nodeIds.add(String(e.fromAppId));
      nodeIds.add(String(e.toAppId));
    }

    const edgeKeys = new Set<string>();
    for (const e of p.edges) {
      edgeKeys.add(`${e.fromAppId}->${e.toAppId}`);
    }

    return {nodeIds, edgeKeys};
  });

  readonly option = computed(() => {
    const g = this.graph();
    const labelsOn = this.showLabels();
    const force = this.useForce();
    const edgeDetails = this.showEdgeDetails();
    const {nodeIds, edgeKeys} = this.highlight();
    const hideOthers = this.shortestPath()?.hideOtherEdges;

    const appType = (n: any): string =>
      n?.app?.type ? String(n.app.type) : 'UNKNOWN';

    const nodes = (g?.nodes ?? [])
      .filter(n => {
        if (!hideOthers) return true;
        return nodeIds.has(String(n.app.id));
      })
      .map(n => {
        const type = appType(n);
        const id = String(n.app.id);
        const isHot = nodeIds.size === 0 || nodeIds.has(id);
        return {
          id: String(n.app.id),
          name: n.app.name,
          value: n.app.id,
          symbolSize: 42,
          category: type,
          label: {show: labelsOn, formatter: '{b}'},
          itemStyle: {
            opacity: isHot ? 1 : 0.45,
          },
        };
      });

    const links = (g?.edges ?? [])
      .filter(e => {
        if (!hideOthers) return true;
        return edgeKeys.has(`${e.fromAppId}->${e.toAppId}`);
      })
      .map(e => {
        const score = e.score ?? (e.matches?.length ?? 0);
        const key = `${e.fromAppId}->${e.toAppId}`;
        const isHot = nodeIds.size === 0 || edgeKeys.has(key);
        const _details = edgeDetails
          ? (e.matches ?? [])
            .slice(0, 8)
            .map(m => `${m.outputVariable} → ${m.inputVariable}`)
            .join('\n')
          : `Score: ${score}`;

        return {
          source: String(e.fromAppId),
          target: String(e.toAppId),
          value: score,
          lineStyle: {
            opacity: isHot ? 1 : 0.25,
          },
          emphasis: {lineStyle: {width: isHot ? 10 : undefined, opacity: 1}},
        };
      });

    // build categories + legend dynamically from present node types
    const presentTypes = Array.from(new Set((g?.nodes ?? []).map(appType)));
    const categories = presentTypes.map(t => ({name: t}));

    return {
      legend: [
        {
          show: true,
          type: 'scroll',
          bottom: 0,
          data: presentTypes,
        },
      ],
      series: [
        {
          type: 'graph',
          layout: force ? 'force' : 'circular',
          roam: true,
          draggable: true,
          data: nodes,
          links,
          categories,
          label: {position: 'right'},
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 10,
          emphasis: {focus: 'adjacency'},
          force: force
            ? {
              repulsion: 220,
              edgeLength: [80, 160],
              gravity: 0.08,
            }
            : undefined,
        },
      ],
    };
  });

  onChartInit(ec: ECharts) {
    this.echartsInstance.set(ec);
  }

  onHover(ev: any) {
    if (ev?.dataType === 'edge') {
      this.hoveredEdge.set(
        this.graph()?.edges.find(
          e => e.fromAppId == ev.data.source && e.toAppId == ev.data.target
        ) ?? null
      );
      this.hoverPos.set({x: ev.event.offsetX, y: ev.event.offsetY});
    } else if (ev?.dataType === 'node') {
      this.hoveredNode.set(
        this.graph()?.nodes
          .map(e => e.app)
          .find(
            e => String(e.id) === ev.data.id
          ) ?? null
      );
      this.hoverPos.set({x: ev.event.offsetX, y: ev.event.offsetY});
    }
  }

  clearHover() {
    this.hoveredEdge.set(null);
    this.hoveredNode.set(null);
    this.hoverPos.set(null);
  }


  fit() {
    this.echartsInstance()?.dispatchAction({type: 'restore'});
    this.echartsInstance()?.resize();
  }

  toggleLabels() {
    this.showLabels.update(v => !v);
  }

  togglePhysics() {
    this.useForce.update(v => !v);
  }

  toggleEdgeDetails() {
    this.showEdgeDetails.update(v => !v);
  }
}
