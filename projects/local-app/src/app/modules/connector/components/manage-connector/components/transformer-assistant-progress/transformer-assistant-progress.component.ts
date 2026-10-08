import {Component, computed, input, output, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {ConnectorTransformerDTO} from '../../../../dto/connector';
import {TransformerAssistantNode, TransformerAssistantProgress} from '../../../../dto/transformer-assistant';
import {TransformerAssistantStatus} from '../../../../store/transformer-assistant/transformer-assistant.reducer';

const VALUE_PREFIX = '[VALUE]';
const CODE_MODULE = 'Custom code';
const TOOLS_MODULE = 'tools';
const KIND_ORDER = ['NATIVE', 'ETL_TOOL', 'CUSTOM_CODE'];

function kindOf(transformer: ConnectorTransformerDTO): string {
  if (transformer.moduleName === CODE_MODULE) {
    return 'CUSTOM_CODE';
  }
  return transformer.moduleName === TOOLS_MODULE || transformer.appImage || transformer.appVersionId ? 'ETL_TOOL' : 'NATIVE';
}

@Component({
  selector: 'app-transformer-assistant-progress',
  standalone: true,
  imports: [MatIcon, MatProgressBar, MatProgressSpinner, TranslatePipe],
  templateUrl: './transformer-assistant-progress.component.html',
  styleUrl: './transformer-assistant-progress.component.scss',
})
export class TransformerAssistantProgressComponent {
  progress = input.required<TransformerAssistantProgress>();
  nodes = input.required<TransformerAssistantNode[]>();
  current = input<TransformerAssistantNode | null>(null);
  status = input.required<TransformerAssistantStatus>();
  patientIdColumn = input<string | null>(null);
  /** Whether the assistant waits for an answer of the user, so the run is paused. */
  waiting = input(false);
  /** Found nodes the user took out of the suggestion. */
  excluded = input<number[]>([]);
  toggled = output<number>();

  readonly detailsOpen = signal(false);
  readonly openNode = signal<number | null>(null);

  readonly percent = computed(() => {
    const {done, total} = this.progress();
    return total === 0 ? 0 : Math.round(done / total * 100);
  });

  toggleDetails(): void {
    this.detailsOpen.update(open => !open);
  }

  toggleNode(node: TransformerAssistantNode): void {
    if (node.status === 'DONE') {
      this.openNode.update(open => open === node.schemaId ? null : node.schemaId);
    }
  }

  icon(node: TransformerAssistantNode): string {
    if (node.status === 'PENDING') {
      return 'schedule';
    }
    if (!node.selectedTransformer?.foundTransformer) {
      return 'help_outline';
    }
    return node.selectedTransformer.selectedTransformers?.length ? 'transform' : 'check_circle';
  }

  isExcluded(node: TransformerAssistantNode): boolean {
    return this.excluded().includes(node.schemaId);
  }

  /** NATIVE, ETL_TOOL or CUSTOM_CODE for every distinct kind of transformer of the node, in this order. */
  kinds(node: TransformerAssistantNode): string[] {
    const kinds = new Set((node.selectedTransformer?.selectedTransformers ?? []).map(kindOf));
    return KIND_ORDER.filter(kind => kinds.has(kind));
  }

  visit(node: TransformerAssistantNode): string {
    const visit = node.visitMapping;
    return [visit?.visitIdMapping, visit?.visitTimestampMapping].filter(Boolean).join(' · ');
  }

  parameters(transformer: ConnectorTransformerDTO): string {
    return [transformer.inputMapping, transformer.hyperparams, transformer.returnMapping]
      .flatMap(mapping => Object.entries(mapping ?? {}))
      .map(([key, value]) => `${key} = ${String(value).replace(VALUE_PREFIX, '')}`)
      .join(', ');
  }
}
