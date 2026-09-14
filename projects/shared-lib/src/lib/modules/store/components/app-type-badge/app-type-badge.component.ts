import {Component, computed, input} from '@angular/core';
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'lib-app-type-badge',
  imports: [
    MatIcon,
    MatTooltip
  ],
  templateUrl: './app-type-badge.component.html',
  styleUrl: './app-type-badge.component.scss'
})
export class AppTypeBadgeComponent {
  type = input<FederatedAppType>(FederatedAppType.ANALYSIS);
  isModel = input<boolean>(false);
  isWorkflow = input<boolean>(false);
  supportsFederatedLearning = input<boolean | undefined>(false);

  className = computed(() =>
    `type-badge ${this.colorClassName()} `
  );

  private readonly textMap: Record<FederatedAppType, (isModel: boolean) => string> = {
    [FederatedAppType.ANALYSIS]: (isModel) => (isModel ? 'inference-only' : 'Trainable'),
    [FederatedAppType.DATA_TRANSFORMATION]: () => 'Data transform',
    [FederatedAppType.EXTRACTOR]: () => 'Extractor',
    [FederatedAppType.EVALUATION]: () => 'Evaluation',
    [FederatedAppType.POST_PROCESSING]: () => 'Postprocessing',
    [FederatedAppType.PRE_PROCESSING]: () => 'Preprocessing',
    [FederatedAppType.SELF_LEARNED]: () => 'Algorithimic-Analysis',
    [FederatedAppType.EXPORT]: () => 'Export',
  };

  colorClassName = computed(() => {
    if (this.isWorkflow()) return 'color-workflow';
    if (this.isModel()) return 'color-model';

    switch (this.type()) {
      case FederatedAppType.DATA_TRANSFORMATION:
        return 'color-data-transformation';
      case FederatedAppType.EXTRACTOR:
        return 'color-database-adopter';
      case FederatedAppType.EVALUATION:
        return 'color-evaluation';
      case FederatedAppType.EXPORT:
        return 'color-export';
      case FederatedAppType.POST_PROCESSING:
        return 'color-post-processing';
      case FederatedAppType.PRE_PROCESSING:
        return 'color-pre-processing';
      case FederatedAppType.SELF_LEARNED:
        return 'color-self-learned';
      case FederatedAppType.ANALYSIS:
      default:
        return 'color-analysis';
    }
  });

  private readonly iconMap: Record<FederatedAppType, (isModel: boolean) => string> = {
    [FederatedAppType.ANALYSIS]: (isModel) => (isModel ? 'insights' : 'analytics'),
    [FederatedAppType.DATA_TRANSFORMATION]: () => 'transform',
    [FederatedAppType.EXTRACTOR]: () => 'storage',
    [FederatedAppType.EVALUATION]: () => 'fact_check',
    [FederatedAppType.POST_PROCESSING]: () => 'tune',
    [FederatedAppType.PRE_PROCESSING]: () => 'filter_alt',
    [FederatedAppType.SELF_LEARNED]: () => 'model_training',
    [FederatedAppType.EXPORT]: () => 'ios_share',
  };

  textFormatted = computed(() => {
      if (this.isWorkflow()) {
        return "Workflow";
      }
      return this.type() ? this.textMap[this.type()!](this.isModel()) : '';
    }
  );

  iconName = computed(() => {
      if (this.isWorkflow()) {
        return "rebase_edit";
      }
      return this.type() ? this.iconMap[this.type()!](this.isModel()) : undefined;
    }
  );

}
