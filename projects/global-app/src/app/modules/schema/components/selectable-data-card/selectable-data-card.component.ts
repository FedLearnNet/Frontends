import {CommonModule} from '@angular/common';
import {Component, computed, input, output} from '@angular/core';
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {DataTypeNodeDTO, DataTypes} from "@global-app/schema/dto/datatype";
import {MatCard} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

@Component({
  selector: 'app-selectable-data-card',
  imports: [
    CommonModule,
    MatCard,
    MatIcon,
    MatIconButton,
    BadgeComponent
  ],
  templateUrl: './selectable-data-card.component.html',
  styleUrl: './selectable-data-card.component.scss',
})
export class SelectableDataCardComponent {
  dataType = input.required<DataTypeNodeDTO>();
  ontologyNode = input.required<OntologyNodeDTO>();
  clinicCount = input<number | null>(null);
  showDragIndicator = input<boolean>(false);
  showDetailButton = input<boolean>(true);

  detailClicked = output<void>();

  readonly primaryOntologyName = computed(() => this.ontologyNode()?.names?.[0] ?? 'Unnamed ontology');
  readonly secondaryOntologyName = computed(() => this.ontologyNode()?.names?.[1] ?? null);
  readonly ontologyCode = computed(() =>
    this.ontologyNode()?.cui
    ?? this.ontologyNode()?.codes?.[0]
    ?? this.ontologyNode()?.id
    ?? '—'
  );
  readonly ontologySource = computed(() =>
    this.ontologyNode()?.sabs?.[0]
    ?? this.ontologyNode()?.lat
    ?? '—'
  );
  readonly shortDescription = computed(() =>
    this.dataType()?.description?.trim()
    || this.ontologyNode()?.description?.trim()
    || 'No description available.'
  );

  emitDetailClick(event: Event): void {
    event.stopPropagation();
    this.detailClicked.emit();
  }

  typeLabel(type?: DataTypes | null): string {
    if (!type) {
      return 'Unknown';
    }

    switch (type) {
      case DataTypes.DATE_TIME:
        return 'Date/Time';
      case DataTypes.CATEGORICAL:
        return 'Categorical';
      default:
        return type;
    }
  }

  typeColor(type?: DataTypes | null): 'BLUE' | 'GREEN' | 'ORANGE' | 'GRAY' {
    switch (type) {
      case DataTypes.INT:
      case DataTypes.FLOAT:
        return 'BLUE';
      case DataTypes.BOOLEAN:
        return 'GREEN';
      case DataTypes.DATE:
      case DataTypes.DATE_TIME:
        return 'ORANGE';
      default:
        return 'GRAY';
    }
  }
}
