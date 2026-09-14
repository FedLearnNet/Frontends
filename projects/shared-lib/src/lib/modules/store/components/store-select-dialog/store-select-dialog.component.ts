import {AfterViewInit, Component, DestroyRef, ElementRef, inject, viewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {TranslatePipe} from "@ngx-translate/core";
import {StoreListComponent} from "@shared-lib/modules/store/components/store-list/store-list.component";
import {MatIcon} from "@angular/material/icon";
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {StoreService} from "@shared-lib/modules/store/store/store.service";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {StoreSelectDialogData} from "@shared-lib/modules/store/model/store-select-dialog";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {debounceTime, fromEvent} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'lib-store-select-dialog',
  imports: [
    MatDialogContent,
    MatIcon,
    MatIconButton,
    MatToolbar,
    TranslatePipe,
    StoreListComponent,
    CloseableDialogTitleComponent
  ],
  templateUrl: './store-select-dialog.component.html',
  styleUrl: './store-select-dialog.component.scss'
})
export class StoreSelectDialogComponent implements AfterViewInit {
  private storeService: StoreService = inject(StoreService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly dialogRef = inject(MatDialogRef<StoreSelectDialogComponent>);
  readonly data = inject<StoreSelectDialogData | undefined>(MAT_DIALOG_DATA);

  dialogContent = viewChild<ElementRef<HTMLElement>>("dialogContent");

  storelist = viewChild<StoreListComponent>("storelist");

  ngAfterViewInit(): void {
    const dialogContent = this.dialogContent();
    if (dialogContent) {
      fromEvent(dialogContent.nativeElement, 'scroll').pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(100)
      ).subscribe(() => {
        if (this.storelist()) {
          const element = dialogContent.nativeElement;
          const scrollPosition = element.scrollTop + element.clientHeight;
          const scrollHeight = element.scrollHeight;
          this.storelist()!.onScroll(scrollPosition, scrollHeight);
        }
      });
    }
  }


  public itemClick(item: StoreDTO) {
    if (item.model !== null) {
      this.storeService.getModel(item.model!.id).subscribe((detail) =>
        this.dialogRef.close({model: detail} as StoreSelectDialogResult)
      );
    } else if (item.workflow !== null) {
      this.dialogRef.close({workflow: item.workflow} as StoreSelectDialogResult)
    } else {
      this.storeService.getApp(item.app!.id).subscribe((detail) =>
        this.dialogRef.close({app: detail} as StoreSelectDialogResult)
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}
