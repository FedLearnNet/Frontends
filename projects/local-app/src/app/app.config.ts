import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideHttpClient, withInterceptors, withXhr} from '@angular/common/http';
import {loadingInterceptor} from '@shared-lib/interceptors/loading.interceptor';
import {provideBffAuth} from '@shared-lib/services/auth';
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {provideStore} from '@ngrx/store';
import {
  importFeatureKey,
  importsReducer
} from './modules/connector/store/import/import.reducer';
import {ImportEffects} from './modules/connector/store/import/import.effects';
import {provideEffects} from '@ngrx/effects';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {provideRouterStore} from '@ngrx/router-store';
import {authInterceptor} from '@shared-lib/interceptors/auth.interseptor';
import {provideRouter, withComponentInputBinding, withRouterConfig} from "@angular/router";
import {routes} from "./app.routes";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {provideNativeDateAdapter} from "@angular/material/core";
import {featureKey as fileKey, filesReducer} from "@shared-lib/modules/files/store/file.reducer";
import {FileEffects} from "@shared-lib/modules/files/store/file.effects";
import {featureKey as workflowKey, workflowReducer} from "@shared-lib/modules/workflow/store/workflow.reducer";
import {featureKey as storeKey, storeReducer} from "@shared-lib/modules/store/store/store.reducer";
import {WorkflowEffects} from "@shared-lib/modules/workflow/store/workflow.effects";
import {StoreEffects} from "@shared-lib/modules/store/store/store.effects";
import {TrainingReviewEffects} from "@local-app/data-review/store/training-review.effects";
import {
  featureKey as trainingReviewKey,
  trainingReviewReducer
} from "@local-app/data-review/store/training-review.reducer";
import {FederatedLearningProjectEffects} from "./modules/training/store/federated-learning-project.effects";
import {
  featureKey as fedTrainingKey,
  federatedLearningProjectReducer
} from "./modules/training/store/federated-learning-project.reducer";
import {featureKey as orchKey, orchReducer} from "@shared-lib/modules/admin/store/orch.reducer";
import {OrchEffects} from "@shared-lib/modules/admin/store/orch.effects";
import {
  featureKey as notificationKey,
  notificationReducer
} from "@local-app/information/store/notification.reducer";
import {NotificationEffects} from "@local-app/information/store/notification.effects";
import {featureKey as searchKey, searchReducer} from "./modules/search/store/search.reducer";
import {SearchEffects} from "./modules/search/store/search.effects";


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withXhr(), withInterceptors([
      loadingInterceptor,
      authInterceptor
    ])),
    provideBffAuth(),
    provideRouter(routes,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })),
    provideTranslateService({
      fallbackLang: localStorage.getItem('language') || 'en',
      loader: provideTranslateHttpLoader({
        prefix: 'assets/i18n/',
        suffix: '.json'
      }),
    }),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideStore({
      [fileKey]: filesReducer,
      [workflowKey]: workflowReducer,
      [storeKey]: storeReducer,
      [trainingReviewKey]: trainingReviewReducer,
      [fedTrainingKey]: federatedLearningProjectReducer,
      [orchKey]: orchReducer,
      [notificationKey]: notificationReducer,
      [searchKey]: searchReducer,
      [importFeatureKey]: importsReducer,
    }),
    provideEffects([
      FileEffects,
      WorkflowEffects,
      FileEffects,
      StoreEffects,
      TrainingReviewEffects,
      FederatedLearningProjectEffects,
      OrchEffects,
      NotificationEffects,
      SearchEffects,
      ImportEffects,
    ]),
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()}),
    provideRouterStore()
  ]
}
