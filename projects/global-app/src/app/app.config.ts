import {ApplicationConfig, isDevMode} from '@angular/core';
import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {provideBffAuth} from '@shared-lib/services/auth';
import {provideRouter, withComponentInputBinding, withRouterConfig} from "@angular/router";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {provideState, provideStore} from "@ngrx/store";
import {provideEffects} from "@ngrx/effects";
import {provideStoreDevtools} from "@ngrx/store-devtools";
import {provideRouterStore} from "@ngrx/router-store";
import {ModelEffects} from "@shared-lib/modules/app-execution/store/model/model.effects";
import {featureKey as modelFeatureKey, modelReducer} from "@shared-lib/modules/app-execution/store/model/model.reducer";
import {authInterceptor} from '@shared-lib/interceptors/auth.interseptor';
import {loadingInterceptor} from "@shared-lib/interceptors/loading.interceptor";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {featureKey as pipelineFeatureKey, pipelineReducer} from "./modules/pipeline/service/pipeline.reducer";
import {featureKey as fileKey, filesReducer} from "@shared-lib/modules/files/store/file.reducer";
import {FileEffects} from "@shared-lib/modules/files/store/file.effects";
import {PipelineEffects} from "./modules/pipeline/service/pipeline.effects";
import {featureKey as testEngineKey, testEngineReducer} from "./modules/tool-development/store/test-engine.reducer";
import {TestEngineEffects} from "./modules/tool-development/store/test-engine.effects";
import {WorkflowEffects} from "@shared-lib/modules/workflow/store/workflow.effects";
import {featureKey as workflowKey, workflowReducer} from "@shared-lib/modules/workflow/store/workflow.reducer";
import {featureKey as storeKey, storeReducer} from "@shared-lib/modules/store/store/store.reducer";
import {StoreEffects} from "@shared-lib/modules/store/store/store.effects";
import {ProjectRunsEffects} from "@global-app/project/store/project-runs.effects";
import {featureKey as projectRunsKey, projectRunsReducer} from "@global-app/project/store/project-runs.reducer";
import {ProjectEffects} from "@global-app/project/store/project.effects";
import {featureKey as projectKey, projectReducer} from "@global-app/project/store/project.reducer";
import {WorkflowChatEffects} from "@shared-lib/modules/workflow/store/workflow-chat.effects";
import {
  featureKey as workflowChatKey,
  workflowChatReducer
} from "@shared-lib/modules/workflow/store/workflow-chat.reducer";
import {DataAnalysisEffects} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.effects";
import {dataAnalysisFeature} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.reducer";
import {auditReducer, featureKey as auditKey} from "./modules/audit/service/audit.reducer";
import {AuditEffects} from "./modules/audit/service/audit.effects";
import {featureKey as orchKey, orchReducer} from "@shared-lib/modules/admin/store/orch.reducer";
import {OrchEffects} from "@shared-lib/modules/admin/store/orch.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        authInterceptor
      ]),
      withFetch()),
    provideBffAuth(),
    provideRouter(routes,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: 'assets/i18n/',
        suffix: '.json'
      }),
    }),
    provideStore({
      [modelFeatureKey]: modelReducer,
      [pipelineFeatureKey]: pipelineReducer,
      [fileKey]: filesReducer,
      [workflowKey]: workflowReducer,
      [workflowChatKey]: workflowChatReducer,
      [storeKey]: storeReducer,
      [projectRunsKey]: projectRunsReducer,
      [projectKey]: projectReducer,
      [auditKey]: auditReducer,
      [orchKey]: orchReducer,
      [testEngineKey]: testEngineReducer,
    }),
    provideState(dataAnalysisFeature),
    provideEffects([
      ModelEffects,
      WorkflowEffects,
      FileEffects,
      PipelineEffects,
      StoreEffects,
      ProjectRunsEffects,
      ProjectEffects,
      WorkflowChatEffects,
      AuditEffects,
      DataAnalysisEffects,
      OrchEffects,
      TestEngineEffects]),
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()}),
    provideRouterStore(),
    provideAnimationsAsync(),
  ],
}
