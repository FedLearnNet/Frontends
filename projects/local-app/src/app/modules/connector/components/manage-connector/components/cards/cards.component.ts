import {Component, computed, inject, input, output} from '@angular/core';
import {ConnectorCard} from "../../../../models/connector-card";
import {MatCard, MatCardAvatar, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';

import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {FunctionExecutionMode, FunctionsDetailDTO} from "../../../../dto/function";
import {KeyValuePipe} from "@angular/common";
import {Store} from "@ngrx/store";
import {selectAppByVersionId} from "@shared-lib/modules/store/store/store.selectors";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";

@Component({
  selector: 'app-connector-cards',
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
  imports: [MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatIconButton, MatIcon, MatCardContent, ErrorCardComponent, KvComponent, KeyValuePipe, BadgeComponent, StatusBadgeComponent]
})
export class ConnectorStepCardsComponent {
  private readonly store: Store = inject(Store);

  readonly data = input.required<ConnectorCard>();
  readonly function = input<FunctionsDetailDTO | undefined>(undefined);

  readonly isAppBased = computed(() => !!this.function()?.appImage);

  readonly isCellMode = computed(() =>
    !this.isAppBased() && this.function()?.mode === FunctionExecutionMode.CELL);

  readonly appName = computed(() => {
    const image = this.function()?.appImage;
    return image ? image.substring(image.lastIndexOf('/') + 1) : '';
  });

  public readonly draggable = input<boolean>();
  public readonly editable = input<boolean>();
  public readonly selected = input<boolean>(false);

  public readonly edit = output<void>();

  readonly tool = computed(() => {
    const id = this.function()?.appVersionId;
    if (id) {
      return this.store.selectSignal(selectAppByVersionId(Number(id)))();
    }
    return undefined;
  });

  public onEditClick(): void {
    this.edit.emit();
  }

  public formatValue(value: unknown): string {
    if (value == null) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

}
