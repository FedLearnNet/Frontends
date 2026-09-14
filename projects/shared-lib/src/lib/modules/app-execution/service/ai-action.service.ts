import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from "@ngrx/store";
import {UiActionDto, UiActionKind, UiActionType} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {Router} from "@angular/router";
import {
  FileDetailDialogComponent
} from "@shared-lib/modules/files/components/file-detail-dialog/file-detail-dialog.component";
import {
  selectDataAnalysisAllFiles
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {selectSelectedApp, selectSelectedModel} from "@shared-lib/modules/store/store/store.selectors";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";


@Injectable({providedIn: 'root'})
export class AiActionService {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router: Router = inject(Router);

  files = this.store.selectSignal(selectDataAnalysisAllFiles);


  handle(a: UiActionDto) {
    switch (a.kind) {
      case UiActionKind.FILE:
        if (a.action === UiActionType.DETAIL) {
          this.openFileDetails(a.relatedId);
        }
        break;
      case UiActionKind.MODEL:
        if (a.action === UiActionType.DETAIL) {
          this.router.navigate(["/store/model", a.relatedId]);
        }
        if (a.action === UiActionType.ADD_TO_WORKFLOW) {
          this.insureLoadedModel(a.relatedId);
          const currentDetail = this.store.selectSignal(selectSelectedModel)();
          if (!currentDetail) {
            return;
          }
          this.store.dispatch(DataAnalysisActions.selectStoreElement({
            storeElement: {
              model: currentDetail
            },
            hyperParams: a.params
          }));
        }
        break;
      case UiActionKind.APP:
        if (a.action === UiActionType.DETAIL) {
          this.router.navigate(["/store", a.relatedId]);
        }
        if (a.action === UiActionType.ADD_TO_WORKFLOW) {
          this.insureLoadedApp(a.relatedId);
          const currentDetail = this.store.selectSignal(selectSelectedApp)();
          if (!currentDetail) {
            return;
          }
          this.store.dispatch(DataAnalysisActions.selectStoreElement({
            storeElement: {
              app: currentDetail
            },
            hyperParams: a.params
          }));
        }
        break;
    }
  }

  handleHover(a: UiActionDto) {
    switch (a.kind) {
      case UiActionKind.FILE:
        if (a.action === UiActionType.DETAIL) {
          //TODO
        }
        break;
      case UiActionKind.MODEL:
        if (a.action === UiActionType.DETAIL) {
          this.insureLoadedModel(a.relatedId);
        }
        break;
      case UiActionKind.APP:
        if (a.action === UiActionType.DETAIL) {
          this.insureLoadedApp(a.relatedId);
        }
        break;
    }
  }

  handleViaButton(kind: string, action: string, id: string) {
    const dto: UiActionDto = this.getUiAction(kind, action, id);
    this.handle(dto);
  }

  handleViaHover(kind: string, action: string, id: string) {
    const dto: UiActionDto = this.getUiAction(kind, action, id);
    this.handleHover(dto);
    return dto;
  }


  getUiAction(kind: string, action: string, id: string) {
    return {
      action: action.toUpperCase().replaceAll("-", "_") as UiActionType,
      kind: kind.toUpperCase() as UiActionKind,
      params: new Map<string, object>(),
      autorun: false,
      label: '',
      relatedId: parseInt(id)
    } as UiActionDto;
  }

  private openFileDetails(fileId: number) {
    const file = this.files()?.find(f => f.id === fileId);
    if (!file) return;
    this.dialog.open(FileDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: file
    });
  }

  private insureLoadedModel(relatedId: number) {
    const currentDetail = this.store.selectSignal(selectSelectedModel)();
    const isLoaded = currentDetail ? currentDetail.id === relatedId : false;
    if (!isLoaded) this.store.dispatch(StoreActions.loadModel({id: relatedId}));
  }

  private insureLoadedApp(relatedId: number) {
    const currentDetail = this.store.selectSignal(selectSelectedApp)();
    const isLoaded = currentDetail ? currentDetail.id === relatedId : false;
    if (!isLoaded) this.store.dispatch(StoreActions.loadApp({idOrSlug: relatedId}));
  }
}
