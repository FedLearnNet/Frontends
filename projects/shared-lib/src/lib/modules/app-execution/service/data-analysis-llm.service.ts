import {inject, Injectable} from "@angular/core";
import {map, Observable} from "rxjs";
import {environment} from "@global-app/env/environment";
import {ResultAnalyzerResultDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-llm";
import {SseClient} from "ngx-sse-client";
import {HttpHeaders} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";


@Injectable({
  providedIn: 'root'
})
export class DataAnalysisLlmService {
  private readonly sseClient: SseClient = inject(SseClient);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'data-analysis/llm'

  analyzeResultStream(id: number, fileId: number): Observable<ResultAnalyzerResultDTO> {
    const url = `${this.getBaseUrl()}/${id}/files/${fileId}/analyze`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'},
      {headers},
      'PUT'
    ).pipe(
      map((event: Event) => {
        if ((event as any).type === 'error') {
          const err = event as ErrorEvent;
          console.error(err.error, err.message);
          throw new Error('SSE connection error');
        }
        const me = event as MessageEvent;
        return JSON.parse(me.data) as ResultAnalyzerResultDTO;
      }));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

}
