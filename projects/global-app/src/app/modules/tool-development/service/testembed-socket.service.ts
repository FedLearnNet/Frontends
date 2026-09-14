import {inject, Injectable, OnDestroy} from '@angular/core';
import {filter, fromEvent, map, mergeMap, Observable, Subject} from 'rxjs'
import {tap} from "rxjs/operators";
import {RunType, TestEmbedEnum, TestEmbedSocketWrapperDTO} from "../dto/socket";
import {ClientConfigDTO, ConfigPydanticDTO} from "../dto/config";
import {ConsoleStdOutDTO, PerformanceDTO} from "../dto/performance";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {TestRunCreateDTO, TestRunDTO} from "../dto/test-run";
import {
  FederatedParticipantDTO,
  FederatedRoundMessageDTO,
  FederatedTestRunCreateDTO,
  FederatedTestRunDTO
} from "../dto/federated-test-run";
import Keycloak from "keycloak-js";
import {LocalFiles} from "@shared-lib/modules/files/dto/file";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";


@Injectable({
  providedIn: 'root'
})
export class ControllerSocketService implements OnDestroy {
  private readonly keycloak: Keycloak = inject(Keycloak);
  private socket?: WebSocket;

  messages$: Observable<TestEmbedSocketWrapperDTO> = new Observable<TestEmbedSocketWrapperDTO>();
  isConnected$: Subject<boolean> = new Subject<boolean>();

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  connectToWebSocket(url: string) {
    try {
      const token = this.keycloak.token!;
      const authorization = encodeURIComponent(`quarkus-http-upgrade#Authorization#Bearer ${token}`);
      this.socket = new WebSocket(url, ['bearer-token-carrier', authorization]);
    } catch (e) {
      console.error('WebSocket connection failed: ', e);
      return;
    }

    this.socket.onopen = async () => {
      this.isConnected$.next(true);
    };

    this.messages$ = fromEvent<MessageEvent>(this.socket, 'message').pipe(
      mergeMap(async (event) => {
        return JSON.parse(event.data) as TestEmbedSocketWrapperDTO;
      }),
      filter((data: TestEmbedSocketWrapperDTO | undefined) => data !== undefined),
      tap((event) => {
        console.log('Received message: ', event!.type, event);
      }),
      map((data) => data as TestEmbedSocketWrapperDTO),
    )

    this.socket.onerror = (error) => {
      console.error('WebSocket error: ', error);
      this.isConnected$.next(false);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed.');
      this.isConnected$.next(false);
    };
  }

  public getServerError$(): Observable<string> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.SERVER_ERROR),
      map(data => data.message as any),
      tap(data => console.error('Received SERVER_ERROR: ', data)),
    );
  }

  public getAppConfig$(): Observable<AppDetailDto> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.CONFIG_CHANGED),
      tap(data => console.log('Received config message: ', data)),
      map(data => data.message as AppDetailDto)
    );
  }

  public getClientConfig$(): Observable<ClientConfigDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.CONFIG_CLIENT_SEND),
      tap(data => console.log('GET CONFIG_CLIENT_SEND: ', data)),
      map(data => data.message as ClientConfigDTO)
    );
  }

  public getClientConsole$(): Observable<ConsoleStdOutDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.CONSOLE_MESSAGE),
      tap(data => console.log('CONSOLE_MESSAGE: ', data)),
      map(data => data.message as ConsoleStdOutDTO)
    );
  }

  public isAppConnected$(): Observable<boolean> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.CLIENT_STARTED || data.type === TestEmbedEnum.CLIENT_STOPPED),
      tap(data => console.log('Received CLIENT_STARTED: ', data)),
      map(data => data.message as any),
      filter(data => data.includes('app')),
      map(data => data.includes("disconnected") === false),
      tap(data => console.log('Received CLIENT_STARTED2: ', data)),
    );
  }

  public getAppConfigPydantic$(): Observable<ConfigPydanticDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.CONFIG_PYDANTIC_CHANGED),
      tap(data => console.log('Received ConfigPydanticDTO message: ', data)),
      map(data => {
        return data.message as ConfigPydanticDTO;
      }),
      tap(data => console.log('Received ConfigPydanticDTO2 message: ', data)),
    );
  }


  public getPerformance$(): Observable<PerformanceDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.APP_PERFORMANCE),
      tap(data => console.log('Received APP_PERFORMANCE message: ', data)),
      map(data => data.message as PerformanceDTO)
    );
  }


  public getRunCreated$(): Observable<TestRunDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.START_RUN),
      tap(data => console.log('Received TestRunDTO create: ', data)),
      map(data => data.message as TestRunDTO),
    );
  }

  public getRunUpdate$(): Observable<TestRunDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.UPDATE_RUN),
      tap(data => console.log('Received TestRunDTO update: ', data)),
      map(data => data.message as TestRunDTO),
    );
  }

  public getDatafiles$(): Observable<LocalFiles[]> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.DATA_LIST_CLIENT_SEND),
      tap(data => console.log('Received datafiles: ', data)),
      map(data => data.message as LocalFiles[])
    );
  }


  public runTest(create: TestRunCreateDTO): void {
    this.sendRequest(TestEmbedEnum.START_RUN, create, RunType.TEST_RUN);
  }

  // ----- federated run observables ---------------------------------------

  public getFederatedRunCreated$(): Observable<FederatedTestRunDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.START_FEDERATED_RUN),
      tap(data => console.log('Received FederatedTestRunDTO create: ', data)),
      map(data => data.message as FederatedTestRunDTO),
    );
  }

  public getFederatedRunUpdate$(): Observable<FederatedTestRunDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.UPDATE_FEDERATED_RUN
        || data.type === TestEmbedEnum.FINISH_FEDERATED_RUN),
      tap(data => console.log('Received FederatedTestRunDTO update: ', data)),
      map(data => data.message as FederatedTestRunDTO),
    );
  }

  public getFederatedParticipantUpdate$(): Observable<FederatedParticipantDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.FEDERATED_PARTICIPANT_UPDATE),
      tap(data => console.log('Received FederatedParticipantUpdateDTO: ', data)),
      map(data => data.message as FederatedParticipantDTO),
    );
  }

  public getFederatedRoundMessage$(): Observable<FederatedRoundMessageDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.FEDERATED_ROUND_MESSAGE),
      tap(data => console.log('Received FederatedRoundMessageDTO: ', data)),
      map(data => data.message as FederatedRoundMessageDTO),
    );
  }

  public getFederatedParticipantLogMessage$(): Observable<RunMessageLogDTO> {
    return this.messages$.pipe(
      filter(data => data.type === TestEmbedEnum.LOG_MESSAGE && data.runType === RunType.FEDERATED_RUN),
      tap(data => console.log('Received federated log message: ', data)),
      map(data => data.message as RunMessageLogDTO),
    );
  }

  public runFederatedTest(create: FederatedTestRunCreateDTO): void {
    this.sendRequest(TestEmbedEnum.START_FEDERATED_RUN, create, RunType.FEDERATED_RUN);
  }

  public notifyStartExperiment(): void {
    this.sendRequest(TestEmbedEnum.NOTIFY_START_EXPERIMENT, {}, RunType.EXPERIMENT_RUN);
  }

  public saveAppConfig(config: AppDetailDto): void {
    this.sendRequest(TestEmbedEnum.CONFIG_CHANGED, config, RunType.NOT_DEFINED);
  }

  public sendRequest(type: TestEmbedEnum, body: object = {}, runType: RunType): void {
    const message: TestEmbedSocketWrapperDTO = {type: type, message: body, runType};
    console.log('Sending message: ', type, message);
    this.socket!.send(JSON.stringify(message));
  }


}
