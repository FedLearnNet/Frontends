import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {endWith, filter, mergeMap, switchMap} from 'rxjs/operators';
import {DataAnalysisActions} from './data-analysis.actions';
import {catchError, EMPTY, from, map, merge, Observable, of, Subject, takeUntil, tap} from "rxjs";
import {DataAnalysisLlmService} from "@shared-lib/modules/app-execution/service/data-analysis-llm.service";
import {ModelWorkflowService} from "@shared-lib/modules/app-execution/service/model-workflow.service";
import {AiActionService} from "@shared-lib/modules/app-execution/service/ai-action.service";
import {ChatWebSocketService} from "@shared-lib/modules/app-execution/service/model-workflow-chat.service";
import {
  ModelWorkflowChatMessageType,
  ModelWorkflowChatWrapperDTO,
  ModelWorkflowMessageDto
} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {
  ModelWorkflowFileManagementService
} from "@shared-lib/modules/app-execution/service/model-workflow-file-management.service";
import {Action} from "@ngrx/store";
import {
  currentStep,
  DataAnalysisRunDTO,
  displayedAttempt,
  isFinalStatus
} from "@shared-lib/modules/app-execution/dto/execution-run";
import {ModelExecutionService} from "@shared-lib/modules/app-execution/service/model-execution.service";
import {ModelWorkflowDetailDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {StoreService} from "@shared-lib/modules/store/store/store.service";

@Injectable()
export class DataAnalysisEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly dataAnalysisLlmService: DataAnalysisLlmService = inject(DataAnalysisLlmService);
  private readonly modelWorkflowService: ModelWorkflowService = inject(ModelWorkflowService);
  private readonly aiAction: AiActionService = inject(AiActionService);
  private readonly ws: ChatWebSocketService = inject(ChatWebSocketService);
  private readonly fileService: ModelWorkflowFileManagementService = inject(ModelWorkflowFileManagementService);
  private readonly executionService: ModelExecutionService = inject(ModelExecutionService);
  private readonly storeService: StoreService = inject(StoreService);

  //Data analysis Crud
  loadDataAnalyses = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.loadDataAnalyses),
      mergeMap(() =>
        this.modelWorkflowService.list().pipe(
          map(workflows => DataAnalysisActions.loadDataAnalysesSuccess({workflows})),
          catchError(error => of(DataAnalysisActions.loadDataAnalysesFailure({error})))
        )
      )
    )
  });

  loadDataAnalysis$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.loadDataAnalysis),
      mergeMap(({id}) =>
        this.modelWorkflowService.retrieve(id).pipe(
          mergeMap((dataAnalysis: ModelWorkflowDetailDTO) => {
            const msgs = dataAnalysis.messages ?? [];
            // Runs still going leave the timeline, the last of them is followed until it is done.
            const isRunning = (m: ModelWorkflowChatWrapperDTO) =>
              m.type === ModelWorkflowChatMessageType.RUN && !isFinalStatus((m.message as DataAnalysisRunDTO).status);
            const lastRunning = [...msgs].reverse().find(isRunning);

            const cleaned: ModelWorkflowDetailDTO = {
              ...dataAnalysis,
              messages: msgs.filter((m) => !isRunning(m)),
            };
            const success = DataAnalysisActions.loadDataAnalysisSuccess({id, dataAnalysis: cleaned});

            if (!lastRunning) return of(success);
            return of(success, DataAnalysisActions.followRun({run: lastRunning.message as DataAnalysisRunDTO}));
          }),
          catchError((error) => of(DataAnalysisActions.loadDataAnalysisFailure({id, error}))),
        ),
      ),
    )
  });


  retrieveDataAnalysisExperiment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.loadDataAnalysisWorkflowRun),
      mergeMap(({id, experimentId}) =>
        this.modelWorkflowService.retrieveWorkflowExperiment(id, experimentId).pipe(
          map(workflow => DataAnalysisActions.loadDataAnalysisWorkflowRunSuccess({id, workflow})),
          catchError(error => of(DataAnalysisActions.loadDataAnalysisWorkflowRunFailure({id, error})))
        )
      )
    )
  });

  deleteDataAnalysis$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.deleteDataAnalysis),
      mergeMap(({id}) =>
        this.modelWorkflowService.delete(id).pipe(
          map(() => DataAnalysisActions.deleteDataAnalysisSuccess({id})),
          catchError(error => of(DataAnalysisActions.deleteDataAnalysisFailure({error})))
        )
      )
    )
  });

  createDataAnalysis$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.createDataAnalysis),
      mergeMap(({workflow}) =>
        this.modelWorkflowService.create(workflow).pipe(
          map(created => DataAnalysisActions.createDataAnalysisSuccess({workflow: created})),
          catchError(error => of(DataAnalysisActions.createDataAnalysisFailure({error})))
        )
      )
    )
  });


  //Other Data analysis effects
  dataAnalysisRunComplete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.runResult),
      filter(({run}) => run.dataAnalysisId != null),
      map(({run}) => DataAnalysisActions.loadFiles({dataAnalysisId: run.dataAnalysisId!}))
    );
  });

  generateAndDownloadReport$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(DataAnalysisActions.generateAndDownloadReport),
        mergeMap(({id}) =>
          this.modelWorkflowService.generateAndDownloadReport(id).pipe(
            tap((anchorElement) => anchorElement.click()),
            catchError(() => {
              return EMPTY;
            })
          )
        )
      )
    },
    {dispatch: false}
  );


  downloadResult$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(DataAnalysisActions.downloadResult),
        mergeMap(({containerId, mode}) =>
          this.executionService.downloadOutput(containerId, mode).pipe(
            tap((anchorElement) => anchorElement.click()),
            catchError(() => {
              return EMPTY;
            })
          )
        )
      )
    },
    {dispatch: false}
  );

  downloadWholeWorkflow$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(DataAnalysisActions.downloadWholeWorkflow),
        mergeMap(({experimentId}) =>
          this.executionService.downloadWholeOutput(experimentId).pipe(
            tap((anchorElement) => anchorElement.click()),
            catchError(() => {
              return EMPTY;
            })
          )
        )
      )
    },
    {dispatch: false}
  );


  analyzeResult$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.analyzeResult),
      mergeMap(({dataAnalysisId, fileId}) =>
        this.dataAnalysisLlmService.analyzeResultStream(dataAnalysisId, fileId).pipe(
          map(result => DataAnalysisActions.analyzeResultChunk({dataAnalysisId, fileId, result})),
          endWith(DataAnalysisActions.analyzeResultSuccess({dataAnalysisId, fileId})),
          catchError(error => of(DataAnalysisActions.analyzeResultFailure({dataAnalysisId, fileId, error})))
        )
      )
    )
  });

  //Chat
  connect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.chatConnect),
      tap(({dataAnalysisId}) => this.ws.connect(dataAnalysisId)),
      switchMap(() => {
        const stop$ = new Subject<void>();
        const opened$ = this.ws.opened().pipe(map(() => DataAnalysisActions.chatSocketOpened()));
        const closed$ = this.ws.closed().pipe(map(() => DataAnalysisActions.chatSocketClosed()));
        const errored$ = this.ws.errored().pipe(map(error => DataAnalysisActions.chatSocketError({error})));

        const inbound$ = this.ws.messages().pipe(
          map((wrapper: ModelWorkflowChatWrapperDTO) =>
            DataAnalysisActions.chatIncomingWrapper({wrapper})
          )
        );

        return merge(opened$, closed$, errored$, inbound$).pipe(takeUntil(stop$));
      })
    );
  });

  onIncoming$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.chatIncomingWrapper),
      map(({wrapper}) => {
        if (wrapper && wrapper.type === ModelWorkflowChatMessageType.CHAT_MESSAGE && (wrapper.message as ModelWorkflowMessageDto).action) {
          this.aiAction.handle((wrapper.message as ModelWorkflowMessageDto).action!);
        }
        return DataAnalysisActions.addDataAnalysisMessage({wrapper})
      })
    );
  });

  sendUser$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(DataAnalysisActions.chatSendUserMessage),
        tap(({content}) => this.ws.sendChatMessage(content))
      );
    },
    {dispatch: false}
  );


  //Files


  loadFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.loadFiles),
      mergeMap(({dataAnalysisId}) =>
        this.fileService.listFiles(dataAnalysisId).pipe(
          map(files => DataAnalysisActions.loadFilesSuccess({files})),
          catchError(error => of(DataAnalysisActions.loadFilesFailure({error})))
        )
      )
    )
  });

  uploadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.uploadFile),
      mergeMap(({dataAnalysisId, file}) =>
        this.fileService.upload(dataAnalysisId, file).pipe(
          map(response => {
            // dispatch progress or success with full response
            if (response.inProgress) {
              return DataAnalysisActions.uploadFileProgress({dataAnalysisId, response});
            }
            return DataAnalysisActions.uploadFileSuccess({dataAnalysisId, response});
          }),
          catchError(error => of(DataAnalysisActions.uploadFileFailure({error})))
        )
      )
    )
  });

  linkFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.linkFile),
      mergeMap(({dataAnalysisId, fileId}) =>
        this.fileService.linkFile(dataAnalysisId, fileId).pipe(
          map((result) => DataAnalysisActions.uploadFileSuccess({
            dataAnalysisId, response: {
              inProgress: false,
              progress: 100,
              result
            }
          })),
          catchError(error => of(DataAnalysisActions.uploadFileFailure({error})))
        )
      )
    )
  });

  uploadFileWithId$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.uploadFileWithFileId),
      mergeMap(({dataAnalysisId, file, fileId}) =>
        this.fileService.upload(dataAnalysisId, file).pipe(
          map(response => {
            // dispatch progress or success with full response
            if (response.inProgress) {
              return DataAnalysisActions.uploadFileProgressWithFileId({dataAnalysisId, response, fileId});
            }
            return DataAnalysisActions.uploadFileSuccessWithFileId({dataAnalysisId, response, fileId});
          }),
          catchError(error => of(DataAnalysisActions.uploadFileFailureWithFileId({error, fileId})))
        )
      )
    )
  });


  deleteFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.deleteFile),
      mergeMap(({dataAnalysisId, fileId}) =>
        this.fileService.deleteFile(dataAnalysisId, fileId).pipe(
          map(() => DataAnalysisActions.deleteFileSuccess({dataAnalysisId, fileId})),
          catchError(error => of(DataAnalysisActions.deleteFileFailure({error})))
        )
      )
    )
  });


  startAnalysisRun$ = createEffect((): Observable<Action> => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startAnalysisRun),
      mergeMap(({dataAnalysisId, data}) => runActions(this.executionService.startAnalysisRun(dataAnalysisId, data)))
    );
  });

  startRun$ = createEffect((): Observable<Action> => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startRun),
      mergeMap(({data}) => runActions(this.executionService.startRun(data)))
    );
  });

  followRun$ = createEffect((): Observable<Action> => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.followRun),
      mergeMap(({run}) => runActions(this.executionService.followRun(run.id)))
    );
  });

  stopRun$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.stopRun),
      mergeMap(({dataAnalysisId, id}) =>
        this.executionService.stopRun(dataAnalysisId, id).pipe(
          mergeMap(run => from([
            DataAnalysisActions.runResult({run}),
            DataAnalysisActions.runComplete(),
          ])),
          catchError(error => of(DataAnalysisActions.runError({error})))
        )
      )
    )
  });


  deleteRun$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.deleteRun),
      mergeMap(({dataAnalysisId, id}) =>
        this.executionService.deleteRun(dataAnalysisId, id).pipe(
          map(_ => DataAnalysisActions.deleteRunSuccess({dataAnalysisId, id})),
          catchError(error => of(DataAnalysisActions.deleteRunFailure({error, dataAnalysisId, id})))
        )
      )
    )
  });


  // What a followed run executes becomes the active tool again.
  followRunLoadStore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.followRun),
      mergeMap(({run}) => {
        const step = currentStep(run);
        const hyperParams = (step && displayedAttempt(step)?.params) ?? {};
        if (run.workflowId != null) {
          return this.storeService.getWorkflow(run.workflowId).pipe(
            map(workflow => DataAnalysisActions.setActiveStoreElement({storeElement: {workflow}, hyperParams}))
          );
        }
        if (step?.modelId != null) {
          return this.storeService.getModel(step.modelId).pipe(
            map(model => DataAnalysisActions.setActiveStoreElement({storeElement: {model}, hyperParams}))
          );
        }
        if (step?.federatedAppVersionId != null) {
          return this.storeService.getAppVersion(step.federatedAppVersionId).pipe(
            map(app => DataAnalysisActions.setActiveStoreElement({storeElement: {app}, hyperParams}))
          );
        }
        return EMPTY;
      })
    )
  });
}

// Every event updates the run; a newly finished step adds it to the timeline, the final event ends it.
function runActions(run$: Observable<DataAnalysisRunDTO>): Observable<Action> {
  let finishedSteps = 0;
  return run$.pipe(
    mergeMap(run => {
      const actions: Action[] = [DataAnalysisActions.runProgress({run})];
      const finished = run.steps.filter(step => isFinalStatus(step.status)).length;
      if (finished > finishedSteps || isFinalStatus(run.status)) {
        finishedSteps = finished;
        actions.push(DataAnalysisActions.runResult({run}));
      }
      if (isFinalStatus(run.status)) {
        actions.push(DataAnalysisActions.runComplete());
      }
      return from(actions);
    }),
    catchError(error => of(DataAnalysisActions.runError({error})))
  );
}
