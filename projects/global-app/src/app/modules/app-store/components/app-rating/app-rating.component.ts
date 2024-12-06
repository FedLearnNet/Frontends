import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatError} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-app-rating',
  standalone: true,
  imports: [MatIconModule, MatSnackBarModule, MatTooltipModule, MatError, MatButtonModule],
  templateUrl: './app-rating.component.html',
  styleUrl: './app-rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRatingComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() rating: number = 3;
  @Input() starCount: number = 5;
  @Input() editMode: boolean = true;
  @Input() ratingAmount?: number;

  @Output() private ratingUpdated = new EventEmitter();

  ratingArr: number[] = [];

  ngOnInit() {
    for (let index = 0; index < this.starCount; index++) {
      this.ratingArr.push(index);
    }
    this.cdr.detectChanges();
  }

  onClick(rating: number) {
    if(!this.editMode) {
      return;
    }
    this.rating = rating;
    this.ratingUpdated.emit(rating);
    this.cdr.detectChanges();
  }

  showIcon(index: number) {
    if (this.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }
}
