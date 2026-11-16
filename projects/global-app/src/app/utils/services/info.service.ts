import {computed, inject, Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {catchError, of} from 'rxjs';
import {environment} from '@global-app/env/environment';

export interface InfoDTO {
  version: string;
}

@Injectable({providedIn: 'root'})
export class InfoService {
  private readonly http = new HttpClient(inject(HttpBackend));

  readonly info = toSignal(this.http.get<InfoDTO>(`${environment.globalLearningApiUrl}/info`)
    .pipe(catchError(() => of(null))));
  readonly loading = computed(() => this.info() === undefined);
}
