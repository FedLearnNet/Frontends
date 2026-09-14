import {Component, input} from '@angular/core';
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'lib-page-wrapper',
  imports: [
    ErrorCardComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './page-wrapper.component.html',
  styleUrl: './page-wrapper.component.scss',
})
export class PageWrapperComponent {
  isEmpty = input<boolean>(false);
  isLoading = input<boolean>(false);
  margin = input<boolean>(true);
  skeletonOnLoading = input<boolean>(false);
  error = input<string | object | null | undefined>();
}
