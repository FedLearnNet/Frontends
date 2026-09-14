import {AfterViewInit, Component, computed, effect, ElementRef, inject, input, output, signal} from '@angular/core';
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {TreeChart} from "echarts/charts";
import {TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";

import {SchemaNodeNestedDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {DataTypeDto, DataTypeTypeEnum} from "@local-app/cohort/dto/data-type";

echarts.use([TreeChart, TooltipComponent, CanvasRenderer]);

type TreeNode = {
  name: string;
  gid: string;
  type: SchemaNodeTypeEnum;
  description?: string;
  dataType?: DataTypeDto;
  schemaNode: SchemaNodeNestedDto | SchemaRootNodeDto;
  children?: TreeNode[];
  symbolSize?: number;
  itemStyle?: any;
  label?: any;
};

@Component({
  selector: 'app-schema-detail-tree',
  imports: [NgxEchartsDirective],
  templateUrl: './schema-detail-tree.component.html',
  styleUrl: './schema-detail-tree.component.scss',
  providers: [provideEchartsCore({echarts})],
})
export class SchemaDetailTreeComponent implements AfterViewInit {
  private readonly elem: ElementRef = inject(ElementRef);
  root = input.required<SchemaRootNodeDto>();
  nodeSelected = output<SchemaNodeNestedDto | SchemaRootNodeDto>();

  widthPx = signal<number | null>(800);
  rendered = signal(true);

  selectedId = signal<string | null>(null);
  echartsOption = signal<EChartsOption | null>(null);

  private readonly levelGapPx = 60;
  private readonly topBottomPaddingPx = 20;

  constructor() {
    effect(() => {
      if (!this.rendered()) {
        this.echartsOption.set(null);
        return;
      }
      const r = this.root();
      if (!r) {
        this.echartsOption.set(null);
        return;
      }
      if (!this.selectedId()) this.selectedId.set(r.globalId);
      this.echartsOption.set(this.buildTreeOption(r));
    });
  }

  ngAfterViewInit(): void {
    const host = this.elem.nativeElement;
    const w = Math.round(host.getBoundingClientRect().width || host.offsetWidth || 0);
    if (w > 0) {
      this.widthPx.set(w);
      if (!this.rendered()) this.rendered.set(true);
    }
  }

  private maxDepth = (n: SchemaNodeNestedDto | SchemaRootNodeDto): number => {
    const children = (n as any).childNodes as SchemaNodeNestedDto[] | undefined;
    if (!children || children.length === 0) return 1;
    let md = 0;
    for (const c of children) md = Math.max(md, this.maxDepth(c));
    return md + 1;
  };

  canvasHeight = computed(() => {
    const r = this.root();
    const depth = this.maxDepth(r);
    return depth * this.levelGapPx + this.topBottomPaddingPx;
  });

  private toTreeNode(n: SchemaNodeNestedDto | SchemaRootNodeDto): TreeNode {
    return {
      name: n.name,
      gid: n.globalId,
      type: n.nodeType,
      description: n.description,
      dataType: (n as any).dataType as DataTypeDto | undefined,
      schemaNode: n,
      symbolSize: this.sizeFor(n),
      label: {position: 'right', verticalAlign: 'middle', align: 'left'},
      itemStyle: {borderWidth: 1},
      children: (n as any).childNodes?.map((c: SchemaNodeNestedDto) => this.toTreeNode(c)) ?? [],
    };
  }

  private sizeFor(n: SchemaNodeNestedDto | SchemaRootNodeDto) {
    if (n.nodeType === SchemaNodeTypeEnum.ROOT) return 30;
    if (n.nodeType === SchemaNodeTypeEnum.GROUP) return 24;
    const dt = (n as any).dataType as DataTypeDto | undefined;
    if (!dt) return 18;
    switch (dt.type) {
      case DataTypeTypeEnum.FILE:
        return 22;
      case DataTypeTypeEnum.CATEGORICAL:
        return 20;
      default:
        return 18;
    }
  }

  private buildTreeOption(root: SchemaRootNodeDto): EChartsOption {
    const treeData = this.toTreeNode(root);

    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (p: any) => {
          const n = p?.data as TreeNode | undefined;
          if (!n) return '';
          const dt = n.dataType;
          return `
            <div style="max-width:320px">
              <b>${n.name}</b><br/>
              <small>${n.gid}</small><br/>
              <i>${n.type}</i><br/>
              ${dt ? `<div>Type: ${dt.name} (${dt.type})</div>` : ''}
              ${n.description ? `<div style="opacity:.8">${n.description}</div>` : ''}
            </div>`;
        }
      },
      series: [{
        type: 'tree',
        data: [treeData],
        orient: 'TB',
        edgeShape: 'polyline',
        edgeForkPosition: '50%',
        top: 20, bottom: 20, left: 40, right: 40,
        initialTreeDepth: -1,
        expandAndCollapse: true,
        roam: false,
        animationDuration: 200,
        animationDurationUpdate: 150,
        symbol: 'circle',
        symbolSize: (_: any, params: any) => params?.data?.symbolSize ?? 18,
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left',
          distance: 6,
          formatter: '{b}',
        },
        lineStyle: {width: 1.2, opacity: 0.85},
        leaves: {label: {position: 'right', align: 'left'}},
        emphasis: {focus: 'descendant'},
      }]
    };
  }

  onChartClick(event: any): void {
    const schemaNode = event?.data?.schemaNode as SchemaNodeNestedDto | SchemaRootNodeDto | undefined;
    if (schemaNode) {
      this.nodeSelected.emit(schemaNode);
    }
  }
}
