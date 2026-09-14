import {Component, computed, input} from '@angular/core';

export type SkeletonVariant = 'detail' | 'grid' | 'list' | 'table';
export type Density = 'comfortable' | 'compact';

@Component({
  selector: 'lib-skeleton-loader',
  imports: [],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  variant = input<SkeletonVariant>('detail');         // layout: 'detail' | 'grid' | 'list'
  showHeader = input<boolean>(true);                  // big heading skeleton
  showActions = input<boolean>(true);                 // action row skeleton
  cards = input<number>(3);                           // used for grid/list
  lines = input<number>(3);                           // body lines for detail/card
  density = input<Density>('comfortable');            // spacing scale
  animate = input<boolean>(true);                     // enable/disable shimmer
  shimmerMs = input<number>(1200);                    // base shimmer speed
  roundness = input<number>(16);                      // card border radius
  title = input<string>()
  tableRows = input<number>(6);
  tableCols = input<number>(5);
  showTableHeader = input<boolean>(true)

  gap = computed(() => this.density() === 'compact' ? 12 : 16);
  pad = computed(() => this.density() === 'compact' ? 16 : 24);
  radius = computed(() => this.roundness());
  cardsArray = computed(() => Array(this.cards()).fill(0));
  linesArray = computed(() => Array(this.lines()).fill(0));

  tableRowsArray = computed(() => Array.from({ length: this.tableRows() }));
  tableColsArray = computed(() => Array.from({ length: this.tableCols() }));

  classes = computed(() => ({
    [`variant-${this.variant()}`]: true,
    [`density-${this.density()}`]: true,
    'no-animate': !this.animate(),
  }));
}
