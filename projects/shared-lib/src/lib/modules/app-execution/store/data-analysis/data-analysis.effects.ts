import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {endWith, filter, mergeMap, share, switchMap} from 'rxjs/operators';
import {DataAnalysisActions} from './data-analysis.actions';
import {catchError, EMPTY, from, map, merge, mergeWith, Observable, of, Subject, takeUntil, tap} from "rxjs";
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
import {RunStatusTypes} from "../../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {DataAnalysisPredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";
import {ModelExecutionService} from "@shared-lib/modules/app-execution/service/model-execution.service";
import {ModelWorkflowDetailDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {StoreService} from "@shared-lib/modules/store/store/store.service";
import {
  hasMoreSteps,
  isFinished
} from "../../../../../../../global-app/src/app/modules/tool-development/helper/run-helper";

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
            const lastRunning = [...msgs]
              .reverse()
              .find(
                (m) =>
                  (m.type === ModelWorkflowChatMessageType.PREDICTION ||
                    m.type === ModelWorkflowChatMessageType.WORKFLOW_PREDICTION) &&
                  m.message != null &&
                  (m.message as any).status === 'RUNNING',
              );

            const cleaned: ModelWorkflowDetailDTO = {
              ...dataAnalysis,
              messages: msgs.filter(
                (m) =>
                  !(
                    (m.type === ModelWorkflowChatMessageType.PREDICTION ||
                      m.type === ModelWorkflowChatMessageType.WORKFLOW_PREDICTION) &&
                    m.message != null &&
                    (m.message as any).status === 'RUNNING'
                  ),
              ),
            };
            const success = DataAnalysisActions.loadDataAnalysisSuccess({id, dataAnalysis: cleaned});

            if (!lastRunning) return of(success);
            return of(
              success,
              lastRunning.type === ModelWorkflowChatMessageType.WORKFLOW_PREDICTION
                ? DataAnalysisActions.startWorkflowRunUpdates({prediction: lastRunning.message as any})
                : DataAnalysisActions.startRunUpdates({prediction: lastRunning.message as any}),
            );
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
      ofType(DataAnalysisActions.addExperimentResults),
      mergeMap(({prediction}) =>
        from([
          DataAnalysisActions.loadFiles({dataAnalysisId: prediction.dataAnalysisId}),
        ])
      )
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


  runWorkflow$ = createEffect((): Observable<Action> => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startWorkflowRun),
      mergeMap(({workflowId, data}) => {
        const stream$: Observable<DataAnalysisPredictionDTO> = this.executionService.runWorkflowModel(workflowId, data).pipe(
          map((prediction: DataAnalysisPredictionDTO) => ({
            ...(prediction || {}),
            dataAnalysisId: workflowId,
          } as DataAnalysisPredictionDTO)),
          share()
        );
        const completedSteps$: Observable<Action> = stream$.pipe(
          filter((prediction) => isFinished(prediction.status)),
          map(p => DataAnalysisActions.addExperimentResults({prediction: p}))
        );
        const workflowCompleted$: Observable<Action> = stream$.pipe(
          filter((prediction) => isWorkflowExecutionTerminal(prediction)),
          map(() => DataAnalysisActions.runComplete())
        );

        const progress$: Observable<Action> = stream$.pipe(
          map(p => DataAnalysisActions.runProgress({prediction: p}))
        );

        return progress$.pipe(
          mergeWith(completedSteps$, workflowCompleted$),
          catchError(error => of(DataAnalysisActions.runError({error})))
        );
      })
    );
  });

  runModel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startRun),
      mergeMap(({data}) =>
        this.executionService.runModel(data).pipe(
          map((prediction: DataAnalysisPredictionDTO) =>
            prediction.status.toUpperCase() === RunStatusTypes.FINISHED.toUpperCase()
              ? DataAnalysisActions.runComplete()
              : DataAnalysisActions.runProgress({prediction})
          ),
          catchError(error => of(DataAnalysisActions.runError({error})))
        )
      )
    )
  });


  stopRun$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.stopRun),
      mergeMap(({dataAnalysisId, id}) =>
        this.executionService.stopRun(dataAnalysisId, id).pipe(
          mergeMap(prediction => from([
            DataAnalysisActions.addExperimentResults({prediction}),
            DataAnalysisActions.runComplete(),
          ])),
          catchError(error => of(DataAnalysisActions.runError({error})))
        )
      )
    )
  });


  stopRunWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.stopWorkflowRun),
      mergeMap(({dataAnalysisId, id, workflowId}) =>
        this.executionService.stopRun(dataAnalysisId, id, {workflowId}).pipe(
          mergeMap(prediction => from([
            DataAnalysisActions.addExperimentResults({prediction}),
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


  deleteRunWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.deleteWorkflowRun),
      mergeMap(({dataAnalysisId, id, workflowId}) =>
        this.executionService.deleteRun(dataAnalysisId, id, workflowId).pipe(
          map(_ => DataAnalysisActions.deleteWorkflowRunSuccess({dataAnalysisId, id, workflowId})),
          catchError(error => of(DataAnalysisActions.deleteWorkflowRunFailure({error, dataAnalysisId, id, workflowId})))
        )
      )
    )
  });

  getRunModel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startRunUpdates),
      mergeMap(({prediction}) =>
        this.executionService.getRunningUpdates(prediction.id).pipe(
          map((prediction: DataAnalysisPredictionDTO) =>
            prediction.status.toUpperCase() === RunStatusTypes.FINISHED.toUpperCase()
              ? DataAnalysisActions.runComplete()
              : DataAnalysisActions.runProgress({prediction})
          ),
          catchError(error => of(DataAnalysisActions.runError({error})))
        )
      )
    )
  });

  getWorkflowUpdates$ = createEffect((): Observable<Action> => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startWorkflowRunUpdates),
      mergeMap(({prediction}) => {
        const stream$: Observable<DataAnalysisPredictionDTO> = this.executionService.getWorkflowRunning(prediction.dataAnalysisId, prediction.workflowId!).pipe(
          map((prediction: DataAnalysisPredictionDTO) => ({
            ...(prediction || {}),
            dataAnalysisId: prediction.dataAnalysisId,
          } as DataAnalysisPredictionDTO)),
          share()
        );
        const completedSteps$: Observable<Action> = stream$.pipe(
          filter((prediction) => isFinished(prediction.status)),
          map(p => DataAnalysisActions.addExperimentResults({prediction: p}))
        );
        const workflowCompleted$: Observable<Action> = stream$.pipe(
          filter((prediction) => isWorkflowExecutionTerminal(prediction)),
          map(() => DataAnalysisActions.runComplete())
        );

        const progress$: Observable<Action> = stream$.pipe(
          map(p => DataAnalysisActions.runProgress({prediction: p}))
        );

        return progress$.pipe(
          mergeWith(completedSteps$, workflowCompleted$),
          catchError(error => of(DataAnalysisActions.runError({error})))
        );
      })
    );
  });


  startRunUpdatesLoadStore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startRunUpdates),
      mergeMap(({prediction}) => {
        if (prediction.appVersionId) {
          return this.storeService.getAppVersion(prediction.appVersionId).pipe(
            map(result => DataAnalysisActions.setActiveStoreElement({
              storeElement: {
                app: result
              }, hyperParams: prediction.hyperParams
            })),
          )
        }
        if (prediction.modelId) {
          return this.storeService.getModel(prediction.modelId).pipe(
            map(result => DataAnalysisActions.setActiveStoreElement({
              storeElement: {
                model: result
              }, hyperParams: prediction.hyperParams
            })),
          )
        }
        return of();
      })
    )
  });

  startRunUpdatesLoadWorkflowStore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataAnalysisActions.startWorkflowRunUpdates),
      mergeMap(({prediction}) => {
        if (prediction.workflowId == null) {
          return of();
        }

        return this.storeService.getWorkflow(prediction.workflowId).pipe(
          map(result => DataAnalysisActions.setActiveStoreElement({
            storeElement: {
              workflow: result
            },
            hyperParams: prediction.hyperParams
          }))
        )
      })
    )
  });
}

function isWorkflowExecutionTerminal(prediction: DataAnalysisPredictionDTO): boolean {
  if (!isFinished(prediction.status)) {
    return false;
  }

  const status = String(prediction.status).toUpperCase();
  if (status === RunStatusTypes.ERROR || status === RunStatusTypes.STOPPED) {
    return true;
  }

  return !hasMoreSteps(prediction);
}
