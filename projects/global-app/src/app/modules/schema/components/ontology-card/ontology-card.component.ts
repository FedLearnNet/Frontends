import {Component, computed, input} from '@angular/core';
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {MatCard} from '@angular/material/card';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

@Component({
  selector: 'app-ontology-card',
  templateUrl: './ontology-card.component.html',
  styleUrl: './ontology-card.component.scss',
  imports: [MatCard, BadgeComponent]
})
export class OntologyCardComponent {
  ontologyNode = input.required<OntologyNodeDTO>();

  readonly primaryName = computed(() => {
    const n = this.ontologyNode();
    return n?.names?.[0] ?? 'Unnamed concept';
  });

  readonly secondaryNames = computed(() => {
    const n = this.ontologyNode();
    if (!n?.names) return [];
    return n.names.slice(1);
  });
}
