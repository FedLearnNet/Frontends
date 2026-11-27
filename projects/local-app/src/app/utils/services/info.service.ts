import {computed, inject, Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {catchError, of} from 'rxjs';
import {environment} from '@local-app/env/environment';

export interface LocalInfoDTO {
  version: string;

  // empty if the Platform is not reachable
  platformVersion?: string;
  platformVersionNewer: boolean;
  globalWebUrl?: string;
}

@Injectable({providedIn: 'root'})
export class InfoService {
  private readonly http = new HttpClient(inject(HttpBackend));

  readonly info = toSignal(this.http.get<LocalInfoDTO>(`${environment.localLearningAPIURL}/info`)
    .pipe(catchError(() => of(null))));
  readonly loading = computed(() => this.info() === undefined);
}
