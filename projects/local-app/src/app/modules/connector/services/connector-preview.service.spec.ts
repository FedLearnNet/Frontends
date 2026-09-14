import {TestBed} from '@angular/core/testing';
import {HttpHeaders} from '@angular/common/http';
import {firstValueFrom, Observable, of, throwError, toArray} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {TranslateService} from '@ngx-translate/core';
import {SseClient} from 'ngx-sse-client';
import {ConnectorPreviewService} from './connector-preview.service';
import {ConnectorConfigDTO} from '../dto/preview';
import {ConnectorDTO} from '../dto/connector';
import {ConnectorCard} from '../models/connector-card';
import {PreviewValidationRequestDTO, PreviewValidationResponseDTO} from '../dto/connector-validation';

describe('ConnectorPreviewService', () => {
  let service: ConnectorPreviewService;
  let apiService: jasmine.SpyObj<ApiService>;
  let sseClient: jasmine.SpyObj<SseClient>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['post']);
    sseClient = jasmine.createSpyObj<SseClient>('SseClient', ['stream']);

    TestBed.configureTestingModule({
      providers: [
        ConnectorPreviewService,
        {provide: ApiService, useValue: apiService},
        {provide: SseClient, useValue: sseClient},
        {
          provide: ApiErrorSnackbarService,
          useValue: jasmine.createSpyObj<ApiErrorSnackbarService>('ApiErrorSnackbarService', [
            'showSnackBar',
            'showSnackBarOnlyText'
          ])
        },
        {
          provide: TranslateService,
          useValue: {instant: (key: string) => key}
        }
      ]
    });

    service = TestBed.inject(ConnectorPreviewService);
  });

  it('posts the typed request to /connectors/preview/pivot and parses jsons', () => {
    const request: ConnectorConfigDTO = {
      cohortId: 7,
      inputConfig: {
        mode: 'FILE',
        file: null,
        fileId: 11,
        fileType: 'EXCEL',
        firstSheetOnly: false,
        hasHeader: true,
        delimiter: ',',
      },
      pivotConfig: {
        valueColumnIndex: {Sheet1: 1, Sheet2: 2}
      }
    };
    apiService.post.and.returnValue(of({
      jsons: [
        JSON.stringify([{patientId: 1, glucose: 123}]),
        JSON.stringify([{patientId: 1, insulin: 8}]),
      ]
    }));

    let result: any[][] | undefined;
    service.previewPivot(request).subscribe(rows => result = rows);

    expect(apiService.post).toHaveBeenCalled();
    const [url, body] = apiService.post.calls.mostRecent().args;
    expect(url).toMatch(/\/connectors\/preview\/pivot$/);
    expect(body).toEqual(request);
    expect(result).toEqual([
      [{patientId: 1, glucose: 123}],
      [{patientId: 1, insulin: 8}],
    ]);
  });

  it('includes pivot configuration in the normal preview request', () => {
    apiService.post.and.returnValue(of({jsons: [JSON.stringify([{result: true}])]}));
    const config = {
      pivotConfig: {valueColumnIndex: {'patients.csv': 1}}
    } as unknown as ConnectorDTO;
    const cards = [{id: 'transformer-1'}] as unknown as ConnectorCard[];

    service.preview(cards, config, new Map(), 7).subscribe();

    const body = apiService.post.calls.mostRecent().args[1] as ConnectorConfigDTO;
    expect(body.pivotConfig).toEqual(config.pivotConfig);
  });

  it('streams preview validation placeholders and replacements through the shared SSE client', async () => {
    const request: PreviewValidationRequestDTO = {
      cohortId: 7,
      inputConfig: {
        mode: 'FILE',
        file: null,
        fileId: 11,
        fileType: 'CSV',
        hasHeader: true,
        delimiter: ',',
        firstSheetOnly: true,
      },
      schemaMapping: [{column: 'age', mapping: 'Demographics.Age', schemaId: 53}],
    };
    const placeholder: PreviewValidationResponseDTO = {
      column: 'age',
      checks: [],
      warnings: null,
    };
    const replacement: PreviewValidationResponseDTO = {
      column: 'age',
      checks: [{value: '42', mapped: true, validated: true, result: {message: 'Valid', valid: true}}],
      warnings: [],
    };
    sseClient.stream.and.returnValue(of(
      new MessageEvent('message', {data: JSON.stringify(placeholder)}),
      new MessageEvent('message', {data: JSON.stringify(replacement)}),
    ) as unknown as Observable<string>);

    const results = await firstValueFrom(service.validatePreview(request).pipe(toArray()));

    expect(results).toEqual([placeholder, replacement]);
    const [url, options, requestOptions, method] = sseClient.stream.calls.mostRecent().args as unknown as [
      string,
      {keepAlive: boolean; responseType: 'event'},
      {body: unknown; headers: HttpHeaders},
      string,
    ];
    expect(url).toMatch(/\/connectors\/preview\/validations$/);
    expect(options).toEqual({keepAlive: false, responseType: 'event'});
    expect(requestOptions?.body).toBe(request);
    expect(requestOptions?.headers instanceof HttpHeaders).toBeTrue();
    expect((requestOptions?.headers as HttpHeaders).get('Content-Type')).toBe('application/json');
    expect((requestOptions?.headers as HttpHeaders).get('Accept')).toBe('text/event-stream');
    expect(method).toBe('POST');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  it('propagates SSE error events', async () => {
    const backendError = new Error('backend failed');
    sseClient.stream.and.returnValue(of({
      type: 'error',
      error: backendError,
      message: 'Server Error',
    } as unknown as Event) as unknown as Observable<string>);

    await expectAsync(firstValueFrom(service.validatePreview({})))
      .toBeRejectedWith(backendError);
  });

  it('fails on malformed SSE JSON payloads', async () => {
    sseClient.stream.and.returnValue(
      of(new MessageEvent('message', {data: '{not-json}'})) as unknown as Observable<string>
    );

    await expectAsync(firstValueFrom(service.validatePreview({})))
      .toBeRejectedWithError(/malformed JSON/);
  });

  it('fails on malformed SSE fields', async () => {
    sseClient.stream.and.returnValue(of(new MessageEvent('message', {
      data: JSON.stringify({column: 'age'}),
    })) as unknown as Observable<string>);

    await expectAsync(firstValueFrom(service.validatePreview({})))
      .toBeRejectedWithError(/invalid response/);
  });

  it('propagates connection failures', async () => {
    sseClient.stream.and.returnValue(throwError(() => new TypeError('connection failed')));

    await expectAsync(firstValueFrom(service.validatePreview({})))
      .toBeRejectedWithError(TypeError, 'connection failed');
  });

  it('cancels the shared SSE stream when the validation subscription is cancelled', () => {
    const teardown = jasmine.createSpy('teardown');
    sseClient.stream.and.returnValue(
      new Observable<Event>(() => teardown) as unknown as Observable<string>
    );

    const subscription = service.validatePreview({}).subscribe();
    subscription.unsubscribe();

    expect(teardown).toHaveBeenCalled();
  });
});
