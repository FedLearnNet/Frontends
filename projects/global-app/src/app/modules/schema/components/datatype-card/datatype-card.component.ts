import {Component, computed, inject, input, model} from '@angular/core';
import {DataTypeNodeDTO, DataTypes} from "../../dto/datatype";
import {MatCard} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-datatype-card',
  templateUrl: './datatype-card.component.html',
  styleUrl: './datatype-card.component.scss',
  imports: [MatCard, MatIcon, BadgeComponent, MatIconButton]
})
export class DatatypeCardComponent {
  private readonly router = inject(Router);

  readonly ontologyId = input<string>();
  readonly showAddBtn = input<boolean>(false);
  dataType = model<DataTypeNodeDTO>();


  readonly hasSchemas = computed(() => (this.dataType()?.schemaIds?.length ?? 0) > 0);
  readonly hasOntologies = computed(() => (this.dataType()?.ontologyIds?.length ?? 0) > 0);
  readonly validationsCount = computed(() => this.dataType()?.validations?.length ?? 0);
  readonly allowedValuesCount = computed(() => this.dataType()?.options?.length ?? 0);


  typeLabel(type?: DataTypes | null): string {
    if (!type) return '—';
    switch (type) {
      case DataTypes.DATE_TIME:
        return 'Date/Time';
      case DataTypes.CATEGORICAL:
        return 'Categorical';
      default:
        return type;
    }
  }

  openDetailPage(): void {
    const dataType = this.dataType();
    if (!dataType) {
      const ontologyId = this.ontologyId();
      this.router.navigate(
        ['/data-modelling/data-types/create'],
        {queryParams: ontologyId ? {ontologyId} : undefined}
      );
      return;
    }
    this.router.navigate(['/data-modelling/data-types', dataType.id]);
  }

}
