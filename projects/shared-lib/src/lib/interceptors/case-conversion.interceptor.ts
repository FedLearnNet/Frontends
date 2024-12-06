import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from "@global-app/env/environment";

@Injectable()
export class CaseConversionInterceptor implements HttpInterceptor {

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const globalApiUrl = environment.globalDBApiUrl;
    if (globalApiUrl && httpRequest.url.includes(globalApiUrl)) {
      return next.handle(httpRequest);
    }

    if (httpRequest.responseType === 'json') {
      return this.handleJsonResponse(httpRequest, next);
    }

    return next.handle(httpRequest);
  }

  private handleJsonResponse(httpRequest: HttpRequest<any>, next: HttpHandler) {
    return next.handle(httpRequest).pipe(map(event => {
      if (event instanceof HttpResponse) {
        event = event.clone({body: this.convertToCamelCase(event.body)});
      }

      return event;
    }));
  }

  private convertToCamelCase(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    if (Array.isArray(body)) {
      return body.map((item) => this.convertToCamelCase(item));
    }

    const newBody: any = {};
    Object.keys(body).forEach((key) => {
      const newKey = key.replace(
        /([-_][a-z])/g,
        (group) => group.charAt(1).toUpperCase()
      );
      newBody[newKey] = this.convertToCamelCase(body[key]);
    });

    return newBody;
  }
}
