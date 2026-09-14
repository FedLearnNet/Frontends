import {inject, Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {SseClient} from 'ngx-sse-client';
import {catchError, map, Observable, takeWhile, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {
  AppTransformerPreviewRequestDTO,
  AppTransformerPreviewStreamDTO
} from '../dto/connector-app-based-transformer';
import {RunStatusTypes} from '../../../../../../global-app/src/app/modules/tool-development/dto/test-run';

@Injectable({providedIn: 'root'})
export class ConnectorAppBasedTransformerService {
  private readonly sseClient: SseClient = inject(SseClient);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'connector/transformer/app-based/preview/stream';

  runStep(request: AppTransformerPreviewRequestDTO): Observable<AppTransformerPreviewStreamDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient
      .stream(
        `${this.apiUrl}/${this.path}`,
        {keepAlive: false, responseType: 'event'},
        {body: request, headers},
        'POST'
      )
      .pipe(
        map(event => {
          if (event.type === 'error') {
            throw new Error((event as any)?.message ?? 'SSE connection error');
          }
          const message = event as MessageEvent;
          const raw = typeof message.data === 'string' ? message.data : JSON.stringify(message.data);
          return JSON.parse(raw) as AppTransformerPreviewStreamDTO;
        }),
        // Include the terminal event, then close the connection.
        takeWhile(message => !message.finished && message.status !== RunStatusTypes.ERROR, true),
        catchError(err => throwError(() => err))
      );
  }
}
