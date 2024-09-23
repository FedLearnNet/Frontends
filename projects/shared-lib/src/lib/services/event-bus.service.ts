import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

/*
  How to use

  Emit event          => this.eventBusService.emit({ name: 'reload-breadcrumb'});
  Subscribe to event  => this.eventBusService.on('reload-breadcrumb').subscribe(() => {});
 */

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

  private eventSubject = new Subject<any>();

  emit(event: any) {
    this.eventSubject.next(event);
  }

  on(eventName: string) {
    return this.eventSubject.asObservable().pipe(
        filter(event => event.name === eventName)
    );
  }
}
