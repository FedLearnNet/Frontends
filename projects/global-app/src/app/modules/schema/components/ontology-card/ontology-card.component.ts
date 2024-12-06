import {Component, Input} from '@angular/core';
import {OntologyDTO} from "@global-app/schema/dto/ontology";

@Component({
  selector: 'app-ontology-card',
  templateUrl: './ontology-card.component.html',
  styleUrl: './ontology-card.component.scss'
})
export class OntologyCardComponent {
  @Input() ontology?: OntologyDTO;
}
