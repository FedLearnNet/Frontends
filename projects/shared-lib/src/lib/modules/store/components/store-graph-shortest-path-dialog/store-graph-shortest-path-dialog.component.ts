import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ShortestPath, ShortestPathDialog} from "@shared-lib/modules/store/model/store-graph";
import {Store} from "@ngrx/store";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {
  StoreGraphListComponent
} from "@shared-lib/modules/store/components/store-graph-list/store-graph-list.component";
import {
  selectStoreGraph,
  selectStoreGraphPaths,
  selectStoreLoading
} from "@shared-lib/modules/store/store/store.selectors";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'lib-store-graph-shortest-path-dialog',
  imports: [
    CloseableDialogTitleComponent,
    TranslatePipe,
    StoreGraphListComponent,
    ErrorCardComponent,
    SkeletonLoaderComponent,
    MatTabGroup,
    MatTab,
    MatButton
  ],
  templateUrl: './store-graph-shortest-path-dialog.component.html',
  styleUrl: './store-graph-shortest-path-dialog.component.scss',
})
export class StoreGraphShortestPathDialogComponent implements OnInit {

  private readonly dialogRef = inject(MatDialogRef<StoreGraphShortestPathDialogComponent>);
  private readonly data = inject<ShortestPathDialog>(MAT_DIALOG_DATA);
  private readonly store: Store = inject<Store>(Store);

  public graph = this.store.selectSignal(selectStoreGraph);
  public paths = this.store.selectSignal(selectStoreGraphPaths);
  public readonly isLoading = this.store.selectSignal(selectStoreLoading);

  public selectedIndex = signal<number>(0);

  shortestPaths = computed(() => {
    const paths = this.paths();
    if (!paths || !paths.length) {
      return undefined;
    }
    return paths.map((p, $index) => {
      return {
        path: p,
        name: '#' + ($index + 1) + ' (' + p.hops + ')',
        hideOtherEdges: true
      } as ShortestPath
    });
  });

  public selectedPath = computed(() => {
    const shortestPaths = this.shortestPaths();
    const selectedIndex = this.selectedIndex();
    if (!shortestPaths || selectedIndex >= shortestPaths.length) {
      return undefined;
    }
    return {
      ...shortestPaths[selectedIndex],
      hideOtherEdges: false
    };
  });

  ngOnInit() {
    this.store.dispatch(StoreActions.loadGraphAndPaths({
      from: this.data.fromAppId,
      to: this.data.toAppId,
      many: this.data.howMany,
      params: {}
    }));
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  select(): void {
    const selectedPath = this.selectedPath();
    if (!selectedPath) {
      this.dialogRef.close();
    }
    this.dialogRef.close(selectedPath?.path);
  }
}
