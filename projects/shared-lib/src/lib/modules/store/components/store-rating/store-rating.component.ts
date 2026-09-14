import {ChangeDetectionStrategy, Component, computed, input, model} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";
import {MatIcon} from "@angular/material/icon";
import {MatError} from "@angular/material/form-field";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'lib-store-rating',
  imports: [
    MatError,
    MatIcon,
    MatIconButton,
    TranslatePipe,
    MatTooltip
  ],
  templateUrl: './store-rating.component.html',
  styleUrl: './store-rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreRatingComponent {
  rating = model<number>(3);
  starCount = input<number>(5);
  editMode = input<boolean>(true);
  ratingAmount = input<number | undefined>(undefined);

  readonly ratingArr = computed(() =>
    Array.from({length: this.starCount()}, (_, i) => i)
  );

  onClick(rating: number) {
    if (!this.editMode()) return;
    this.rating.set(rating);
  }

  showIcon(index: number): 'star' | 'star_border' {
    return this.rating() >= index + 1 ? 'star' : 'star_border';
  }
}
