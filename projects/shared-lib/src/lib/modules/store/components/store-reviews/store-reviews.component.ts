import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {DatePipe} from "@angular/common";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {TranslatePipe} from "@ngx-translate/core";
import {StoreRatingComponent} from "@shared-lib/modules/store/components/store-rating/store-rating.component";
import Keycloak from "keycloak-js";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {Store} from '@ngrx/store';
import {ModelVersionDto} from '@shared-lib/modules/app-execution/dto/model';
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {StoreRatingCreateDTO, StoreRatingDTO} from "@shared-lib/modules/store/dto/store.rating";
import {
  selectAppRatings,
  selectModelVersionRatings,
  selectStoreLoading
} from "@shared-lib/modules/store/store/store.selectors";
import {MatProgressBar} from "@angular/material/progress-bar";


@Component({
  selector: 'lib-store-reviews',
  imports: [
    MatCardModule,
    DatePipe,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
    StoreRatingComponent,
    MatProgressBar,
  ],
  templateUrl: './store-reviews.component.html',
  styleUrl: './store-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreReviewsComponent {
  private readonly keycloak: Keycloak = inject(Keycloak);
  private readonly store = inject(Store);

  readonly uid = this.keycloak?.profile?.username;
  app = input<AppDetailDto | null>(null);
  modelVersion = input<ModelVersionDto | null>(null);

  currentId = computed<number>(() => this.app()?.id ?? this.modelVersion()!.id);

  ratingFormControl = new FormControl<string>('', {nonNullable: true, validators: [Validators.required]});
  rating = signal<number>(3);
  isLoading = this.store.selectSignal(selectStoreLoading);

  currentReviews = computed<StoreRatingDTO[]>(() => {
    const id = this.currentId();
    if (this.app()) return this.store.selectSignal(selectAppRatings(id))();
    if (this.modelVersion()) return this.store.selectSignal(selectModelVersionRatings(id))();
    return [];
  });


  private readonly loadOnIdChange = effect(() => {
    const id = this.currentId();
    if (this.app()) {
      this.store.dispatch(StoreActions.loadAppRatings({appId: id}));
    }
    if (this.modelVersion()) {
      this.store.dispatch(StoreActions.loadModelRatings({modelId: id}));
    }
  });

  private readonly syncUserReview = effect(() => {
    const reviews = this.currentReviews();

    if (!this.uid || !Array.isArray(reviews)) {
      return;
    }
    const mine = reviews.find(r => this.isReviewFromCurrentUser(r)) ?? null;
    if (mine === null) {
      return;
    }
    if (mine.reviewText) {
      this.ratingFormControl.setValue(mine.reviewText);
    }
    if (mine.rating) {
      this.rating.set(mine.rating);
    }

  });

  isReviewFromCurrentUser(r: StoreRatingDTO) {
    return r.keycloakId === this.uid
  }

  saveReview() {
    if (this.ratingFormControl.invalid) return;

    const dto: StoreRatingCreateDTO = {
      rating: this.rating(),
      reviewText: this.ratingFormControl.value,
    } as StoreRatingCreateDTO;

    const app = this.app();
    const mv = this.modelVersion();

    if (app) {
      this.store.dispatch(StoreActions.createAppRating({appId: app.id, dto}));
      return;
    }
    if (mv) {
      this.store.dispatch(StoreActions.createModelRating({modelVersionId: mv.id as unknown as number, dto}));
      return;
    }
  }
}
