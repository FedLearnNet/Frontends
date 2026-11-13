import {DestroyRef, inject, Injectable} from '@angular/core';
import {CanDeactivateFn} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {
  UnsavedChangesDecision,
  UnsavedChangesDialogComponent
} from '@shared-lib/components/unsaved-changes-dialog/unsaved-changes-dialog.component';

export interface UnsavedChangesHandler {
  hasUnsavedChanges(): boolean;
  save(): Observable<boolean>;
}

/**
 * Keeps track of the components that currently hold unsaved edits and asks the user
 * what to do before they are navigated away from (route change, tab change, page unload).
 */
@Injectable({providedIn: 'root'})
export class UnsavedChangesService {
  private readonly dialog = inject(MatDialog);
  private readonly handlers = new Set<UnsavedChangesHandler>();

  constructor() {
    window.addEventListener('beforeunload', event => {
      if (this.hasUnsavedChanges()) {
        event.preventDefault();
      }
    });
  }

  register(handler: UnsavedChangesHandler, destroyRef: DestroyRef = inject(DestroyRef)): void {
    this.handlers.add(handler);
    destroyRef.onDestroy(() => this.handlers.delete(handler));
  }

  hasUnsavedChanges(): boolean {
    return [...this.handlers].some(h => h.hasUnsavedChanges());
  }

  confirmLeave(): Observable<boolean> {
    const dirty = [...this.handlers].filter(h => h.hasUnsavedChanges());
    if (!dirty.length) {
      return of(true);
    }
    return this.dialog
      .open<UnsavedChangesDialogComponent, void, UnsavedChangesDecision>(UnsavedChangesDialogComponent, {
        disableClose: true,
        autoFocus: false,
      })
      .afterClosed()
      .pipe(
        switchMap((decision): Observable<boolean> => {
          switch (decision) {
            case 'discard':
              return of(true);
            case 'save':
              return forkJoin(dirty.map(h => h.save())).pipe(map(results => results.every(Boolean)));
            default:
              return of(false);
          }
        })
      );
  }
}

export const unsavedChangesGuard: CanDeactivateFn<unknown> = () => inject(UnsavedChangesService).confirmLeave();
