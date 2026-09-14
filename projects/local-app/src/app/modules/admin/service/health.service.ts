import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';

import {environment} from '@local-app/env/environment';
import {ServiceBox} from "../model/health.model";
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {HealthCheckDto, HealthResponseDto, UpDownUnknown} from "../dto/health";

@Injectable({
  providedIn: 'root'
})
export class LocalApiHealthService {
  private http: HttpClient = inject(HttpClient);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = '/q/health/ready'

  streamBoxes(): Observable<ServiceBox[]> {
    return this.http.get<HealthResponseDto>(this.getBaseUrl(), {observe: 'response'}).pipe(
      map((r: HttpResponse<HealthResponseDto>) => r.body as HealthResponseDto),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 503 && err.error) {
          return of(this.coerceHealthResponseDto(err.error));
        }
        if (err.status === 503 && typeof err.error === 'string') {
          return of(JSON.parse(err.error) as HealthResponseDto);
        }
        throw err;
      }),
      map(resp => this.toBoxes(resp))
    );
  }

  private coerceHealthResponseDto(payload: any): HealthResponseDto {
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload) as HealthResponseDto;
      } catch {
        //TODO
      }
    }
    return payload as HealthResponseDto;
  }

  private toBoxes(resp: HealthResponseDto): ServiceBox[] {
    const checks = resp?.checks ?? [];

    // API (this service)
    const apiReachable: UpDownUnknown = 'UP'; //if its get response always true
    const apiDb = this.pickDbStatus(checks);
    const apiDbMeta = this.pickDbMeta(checks);
    const apiWs = this.pickStatusByName(checks, n => n.startsWith('websocket-client'));
    const apiWsMeta = this.pickWsMeta(checks);

    // Orch-API (remote via orch-api-remote payload)
    const orchRemote = this.pickRemote(checks, 'orch-api-remote');
    const orchReachable = orchRemote.reachable;
    const orchReachMeta = orchRemote.reachableMeta;
    if (orchReachMeta) {
      delete orchReachMeta['payload'];
    }
    const orchDb = orchRemote.db;
    const orchDbMeta = orchRemote.dbMeta;
    const orchDocker = orchRemote.docker;
    const orchDockerMeta = orchRemote.dockerMeta;

    // Controller (remote via controller)
    const ctrlRemote = this.pickRemote(checks, 'controller');
    const controllerReachable = ctrlRemote.reachable;
    const controllerReachMeta = ctrlRemote.reachableMeta;
    if (controllerReachMeta) {
      delete controllerReachMeta['payload'];
    }

    // Import-API (remote via import-api-remote)
    const importerRemote = this.pickRemote(checks, 'import-api-remote');
    const importerReachable = importerRemote.reachable;
    const importerReachMeta = importerRemote.reachableMeta;
    const importerDb = importerRemote.db;
    const importerDbMeta = importerRemote.dbMeta;

    return [
      {
        key: 'api',
        title: 'API',
        reachable: apiReachable,
        items: [
          {label: 'Database connected', status: apiDb, meta: apiDbMeta},
          {label: 'WebSocket connected', status: apiWs, meta: apiWsMeta}
        ]
      },
      {
        key: 'orch',
        title: 'Orch-API',
        reachable: orchReachable,
        reachableMeta: orchReachMeta,
        items: [
          {label: 'Docker connected', status: orchDocker, meta: orchDockerMeta},
          {label: 'Database connected', status: orchDb, meta: orchDbMeta}
        ]
      },
      {
        key: 'controller',
        title: 'Controller',
        reachable: controllerReachable,
        reachableMeta: controllerReachMeta,
        items: []
      },
      {
        key: 'importer',
        title: 'Import-API',
        reachable: importerReachable,
        reachableMeta: importerReachMeta,
        items: [
          {label: 'Database connected', status: importerDb, meta: importerDbMeta}
        ]
      }
    ];
  }

  // ---------------- Helpers ----------------
  private pickStatusByName(checks: HealthCheckDto[], pred: (name: string) => boolean): UpDownUnknown {
    const c = checks.find(ch => pred(ch.name));
    return c?.status ?? 'UNKNOWN';
  }

  private pickDbStatus(checks: HealthCheckDto[]): UpDownUnknown {
    const c = this.findDbCheck(checks);
    return c?.status ?? 'UNKNOWN';
  }

  private pickDbMeta(checks: HealthCheckDto[]): Record<string, string | number> | undefined {
    const c = this.findDbCheck(checks);
    if (!c?.data) return undefined;
    return c.data;
  }

  private findDbCheck(checks: HealthCheckDto[]): HealthCheckDto | undefined {
    return checks.find(ch => {
      const n = ch.name.toLowerCase();
      return n.includes('datasource') || n.includes('database');
    });
  }

  private pickWsMeta(checks: HealthCheckDto[]): Record<string, string | number> | undefined {
    const c = checks.find(ch => ch.name.startsWith('websocket-client'));
    if (!c?.data) return undefined;
    return c.data;
  }

  private pickRemote(checks: HealthCheckDto[], checkName: string): {
    reachable: UpDownUnknown,
    reachableMeta?: Record<string, string | number>,
    db: UpDownUnknown, dbMeta?: Record<string, string | number>,
    docker: UpDownUnknown, dockerMeta?: Record<string, string | number>
  } {
    const c = checks.find(x => x.name === checkName);
    const reachable: UpDownUnknown = c?.status ?? 'UNKNOWN';
    let reachableMeta = c?.data;

    let db: UpDownUnknown = 'UNKNOWN';
    let dbMeta: Record<string, string | number> | undefined;
    let docker: UpDownUnknown = 'UNKNOWN';
    let dockerMeta: Record<string, string | number> | undefined;

    const payloadStr = c?.data?.['payload'];
    if (typeof payloadStr === 'string') {
      try {
        const payload = JSON.parse(payloadStr) as HealthResponseDto;
        const pChecks = payload?.checks ?? [];

        // DB in remote payload
        const dbCheck = this.findDbCheck(pChecks);
        db = dbCheck?.status ?? 'UNKNOWN';
        dbMeta = dbCheck?.data;

        // Docker in remote payload
        const dockerCheck = pChecks.find(pc => pc.name.toLowerCase().includes('docker-host-readiness'));
        docker = dockerCheck?.status ?? 'UNKNOWN';
        dockerMeta = dockerCheck?.data;

        // Controller’s Go service may include UTC in payload → surface it as reach meta
        if (!dockerCheck && !dbCheck && payload?.status && (payload as any)['utc']) {
          (reachableMeta as any) = Object.assign({}, reachableMeta, {utc: (payload as any)['utc']});
        }
      } catch {
        // ignore parse errors
      }
    }
    return {reachable, reachableMeta, db, dbMeta, docker, dockerMeta};
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}${this.path}`;
  }
}
