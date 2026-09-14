import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {SseClient} from 'ngx-sse-client';
import {AppBasedExtractorRequestDTO, ConnectorExtractorStreamDTO} from "../dto/connector-app-based-extractor";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {catchError, finalize, map, Observable, takeWhile, tap, throwError} from "rxjs";
import {environment} from "@local-app/env/environment";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";


@Injectable({providedIn: 'root'})
export class ConnectorAppBasedExtractorService {
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly _connected = signal(false);
  private readonly _running = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _last = signal<ConnectorExtractorStreamDTO | null>(null);

  readonly connected = this._connected.asReadonly();
  readonly running = this._running.asReadonly();
  readonly error = this._error.asReadonly();
  readonly last = this._last.asReadonly();
  readonly hasError = computed(() => !!this._error());


  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = '/connector/extractor/app-based/stream'

  runApp(toCreate: AppBasedExtractorRequestDTO): Observable<ConnectorExtractorStreamDTO> {
    const url = `${this.apiUrl}/${this.path}`;

    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    this._connected.set(false);
    this._running.set(true);
    this._error.set(null);
    this._last.set(null);

    return this.sseClient
      .stream(
        url,
        {keepAlive: false, responseType: 'event'},
        {body: toCreate, headers},
        'POST'
      )
      .pipe(
        map(evt => {
          if (evt.type === 'error') {
            const errorEvent = evt as ErrorEvent;
            const msg = (errorEvent as any)?.message ?? 'SSE connection error';
            throw new Error(msg);
          }

          const messageEvent = evt as MessageEvent;

          const raw = typeof messageEvent.data === 'string' ? messageEvent.data : JSON.stringify(messageEvent.data);
          const parsed = JSON.parse(raw);

          return parsed as ConnectorExtractorStreamDTO;
        }),
        tap(msg => {
          this._connected.set(true);
          this._last.set(msg);

          if (msg.status === RunStatusTypes.ERROR) {
            this._error.set(msg.lastError ?? 'Run failed');
          }
          if (msg.status === RunStatusTypes.FINISHED && msg.uploadInfo) {
            this._running.set(false);
          }
        }),
        takeWhile(msg => !(msg.status === RunStatusTypes.FINISHED && msg.uploadInfo), true), // include terminal event
        finalize(() => {
          this._connected.set(false);
          this._running.set(false);
        }),
        catchError(err => {
          const msg = err?.message ?? 'SSE stream error';
          this._error.set(msg);
          this._connected.set(false);
          this._running.set(false);
          return throwError(() => err);
        })
      );
  }
}
