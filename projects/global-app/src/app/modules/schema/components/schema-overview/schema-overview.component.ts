import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {ActionCardButtonComponent} from "@shared-lib/components/action-card-button/action-card-button.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

interface OverviewCard {
  titleKey: string;
  descriptionKey: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-schema-overview',
  templateUrl: './schema-overview.component.html',
  styleUrl: './schema-overview.component.scss',
  imports: [RouterLink, TranslatePipe, ActionCardButtonComponent, PageWrapperComponent, HeaderComponent]
})
export class SchemaOverviewComponent {
  readonly cards = signal<OverviewCard[]>([
    {
      titleKey: 'MENU.ONTOLOGY_MANAGEMENT',
      descriptionKey: 'DATA_MODELER.ONTOLOGY_MANAGEMENT',
      icon: 'hub',
      route: 'ontology',
    },
    {
      titleKey: 'MENU.SCHEMA_MANAGEMENT',
      descriptionKey: 'DATA_MODELER.SCHEMA_MANAGEMENT',
      icon: 'account_tree',
      route: 'schema',
    },
    {
      titleKey: 'MENU.DATA_TYPES',
      descriptionKey: 'DATA_MODELER.DATA_TYPE',
      icon: 'data_object',
      route: 'data-types',
    },
    {
      titleKey: 'BUTTON.DATA_GENERATION',
      descriptionKey: 'DATA_MODELER.DATA_GENERATION',
      icon: 'dataset',
      route: 'data',
    },
  ]);
}
