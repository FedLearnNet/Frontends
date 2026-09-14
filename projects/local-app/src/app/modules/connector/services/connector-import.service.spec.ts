import {HttpClient, HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {SseClient} from 'ngx-sse-client';
import {Observable, of, Subject, throwError} from 'rxjs';
import {ImportEventDTO} from '../dto/import-progress';
import {ImportStreamMessage} from '../dto/connector-import';
import {ConnectorImportService} from './connector-import.service';

describe('ConnectorImportService', () => {
  let service: ConnectorImportService;
  let http: jasmine.SpyObj<HttpClient>;
  let sseClient: jasmine.SpyObj<SseClient>;
  let httpEvents: Subject<HttpEvent<unknown>>;

  beforeEach(() => {
    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['request']);
    sseClient = jasmine.createSpyObj<SseClient>('SseClient', ['stream']);
    httpEvents = new Subject<HttpEvent<unknown>>();
    http.request.and.returnValue(httpEvents);

    TestBed.configureTestingModule({
      providers: [
        ConnectorImportService,
        {provide: HttpClient, useValue: http},
        {provide: SseClient, useValue: sseClient},
      ],
    });
    service = TestBed.inject(ConnectorImportService);
  });

  it('follows live SSE reading events as soon as the upload finishes', () => {
    const sseEvents = new Subject<Event>();
    sseClient.stream.and.returnValue(sseEvents as unknown as Observable<string>);
    const messages: ImportStreamMessage[] = [];
    const subscription = service.importStream(
      7,
      new File(['content'], 'large.zip'),
      {fileType: 'MULTIPLE_CSV_ZIP'},
      undefined,
      'import-1',
    ).subscribe(message => messages.push(message));

    httpEvents.next({type: HttpEventType.UploadProgress, loaded: 7, total: 7});
    const reading: ImportEventDTO = {
      importId: 'import-1',
      phase: 'PARSING',
      table: {name: 'patients', position: 1, total: 30, state: 'READING', rows: 250_000},
    };
    sseEvents.next(new MessageEvent('message', {data: JSON.stringify(reading)}));

    expect(messages).toEqual([
      {kind: 'upload', loaded: 7, total: 7, percent: 100},
      {kind: 'event', event: reading},
    ]);
    expect(sseClient.stream).toHaveBeenCalledTimes(1);

    const terminal: ImportEventDTO = {
      importId: 'import-1',
      phase: 'SUCCEEDED',
      last: true,
    };
    httpEvents.next(new HttpResponse({body: [terminal]}));
    expect(messages.at(-1)).toEqual({kind: 'event', event: terminal});
    subscription.unsubscribe();
  });

  it('retries the SSE connection while the backend creates the import tracker', fakeAsync(() => {
    const reading: ImportEventDTO = {
      importId: 'import-2',
      phase: 'PARSING',
      table: {name: 'admissions', position: 2, total: 30, state: 'READING'},
    };
    sseClient.stream.and.returnValues(
      throwError(() => new Error('No import found yet')),
      of(new MessageEvent('message', {data: JSON.stringify(reading)})) as unknown as Observable<string>,
    );
    const messages: ImportStreamMessage[] = [];
    const subscription = service.importStream(
      7,
      new File(['content'], 'large.zip'),
      undefined,
      undefined,
      'import-2',
    ).subscribe(message => messages.push(message));

    httpEvents.next({type: HttpEventType.UploadProgress, loaded: 7, total: 7});
    expect(sseClient.stream).toHaveBeenCalledTimes(1);

    tick(500);

    expect(sseClient.stream).toHaveBeenCalledTimes(2);
    expect(messages.at(-1)).toEqual({kind: 'event', event: reading});
    subscription.unsubscribe();
  }));

  it('cancels the live SSE follower when the import subscription is cancelled', () => {
    const sseTeardown = jasmine.createSpy('sseTeardown');
    sseClient.stream.and.returnValue(
      new Observable<Event>(() => sseTeardown) as unknown as Observable<string>,
    );
    const subscription = service.importStream(
      7,
      new File(['content'], 'large.zip'),
      undefined,
      undefined,
      'import-3',
    ).subscribe();

    httpEvents.next({type: HttpEventType.UploadProgress, loaded: 7, total: 7});
    subscription.unsubscribe();

    expect(sseTeardown).toHaveBeenCalled();
  });
});
