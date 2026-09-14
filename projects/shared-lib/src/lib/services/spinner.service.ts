import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  loadingObservable$: Observable<boolean> = this._loading$.asObservable();

  set(loading: boolean): void {
    this._loading$.next(loading);
  }
}
