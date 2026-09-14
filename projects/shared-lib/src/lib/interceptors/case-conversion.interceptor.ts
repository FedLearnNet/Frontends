import {HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from "@global-app/env/environment";
import {environment as localEnvironment} from "@local-app/env/environment";

const SKIP_VALUE_FOR_KEYS = [
    'schema_mapping',
];

function handleJsonResponse(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  return next(req).pipe(map(event => {
    if (event instanceof HttpResponse) {
      event = event.clone({body: convertToCamelCase(event.body)});
    }
    return event;
  }));
}

function convertToCamelCase(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map((item) => convertToCamelCase(item));
  }

  const newBody: any = {};
  Object.keys(body).forEach((key) => {
    const newKey = key.replace(/([-_][a-z])/g, (group) =>
        group.charAt(1).toUpperCase()
    );

    if (SKIP_VALUE_FOR_KEYS.includes(key)) {
      newBody[newKey] = body[key];
    } else {
      newBody[newKey] = convertToCamelCase(body[key]);
    }
  });

  return newBody;
}

export function caseConversionInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const globalApiUrl = environment.globalLearningApiUrl;
  if (globalApiUrl && req.url.includes(globalApiUrl)) {
    return next(req);
  }
  const datamodelerApiUrl = environment.datamodelerApiUrl;
  if (datamodelerApiUrl && req.url.includes(datamodelerApiUrl)) {
    return next(req);
  }
  const localLearningAPIURL = localEnvironment.localLearningAPIURL;
  if (localLearningAPIURL && req.url.includes(localLearningAPIURL)) {
    return next(req);
  }
  if (req.responseType === 'json') {
    return handleJsonResponse(req, next);
  }

  return next(req);
}
