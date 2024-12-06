import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit} from '@angular/core';
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {MatCardModule} from "@angular/material/card";
import {DatePipe} from "@angular/common";
import {MatDividerModule} from "@angular/material/divider";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {AppRatingDto} from "@global-app/app-store/dto/app";
import {KeycloakService} from "keycloak-angular";
import {AppRatingComponent} from "@global-app/app-store/components/app-rating/app-rating.component";
import {MatButtonModule} from "@angular/material/button";
import {AppService} from "@global-app/app-store/service/app.service";

@Component({
  selector: 'app-app-reviews',
  standalone: true,
  imports: [MatCardModule, DatePipe, MatDividerModule, MatButtonModule,
    FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, AppRatingComponent],
  templateUrl: './app-reviews.component.html',
  styleUrl: './app-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppReviewsComponent implements OnInit {
  private readonly keycloak: KeycloakService = inject(KeycloakService);
  private readonly appService: AppService = inject(AppService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() app: AppDetailDto;

  ratingFormControl = new FormControl('', [Validators.required]);
  newUserRating = 3;

  usersReview?: AppRatingDto;
  userHasReviewed = false;


  ngOnInit() {
    if(this.app.reviews) {
      this.usersReview = this.app.reviews.find(rating => rating.keycloakId === this.keycloak.getUsername());
      //this.userHasReviewed = !!this.usersReview;
      //TODO deside if we want to allow users to edit their reviews
      if(this.userHasReviewed && this.usersReview?.reviewText){
        this.ratingFormControl.setValue(this.usersReview?.reviewText);
        this.ratingFormControl.disable();
      }
    }
    this.cdr.detectChanges();
  }

  updateRating(rating: number) {
    this.newUserRating = rating;
    this.cdr.detectChanges();
  }

  addReview() {
    if(this.ratingFormControl.invalid){
      return;
    }
    this.appService.addRating(this.app.id, this.newUserRating, this.ratingFormControl.value!).subscribe((rating) => {
      this.userHasReviewed = true;
      this.usersReview = rating;
      this.ratingFormControl.disable();
      this.app.reviews.push(rating);
      this.cdr.detectChanges();
      //TODO Update all other parts via redux
    });
  }
}
