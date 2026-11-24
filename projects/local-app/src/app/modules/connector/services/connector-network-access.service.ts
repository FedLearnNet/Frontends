import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {StoreService} from '@shared-lib/modules/store/store/store.service';
import {NetworkAccess, networkAccessOf, NO_NETWORK_ACCESS} from '@shared-lib/modules/store/model/network-access';
import {ConnectorDTO} from '../dto/connector';
import {connectorToolVersionIds} from '../helper/connector-config-helper';

/**
 * Resolves which tools of a connector need internet or host access.
 */
@Injectable({providedIn: 'root'})
export class ConnectorNetworkAccessService {
  private readonly storeService = inject(StoreService);

  load(connector: ConnectorDTO): Observable<NetworkAccess> {
    const ids = connectorToolVersionIds(connector);
    if (!ids.length) {
      return of(NO_NETWORK_ACCESS);
    }
    return this.storeService.getAppVersions(ids).pipe(
      map(apps => networkAccessOf(apps ?? [])),
      catchError(() => of(NO_NETWORK_ACCESS)),
    );
  }
}
