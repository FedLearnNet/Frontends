import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routes';
import {SharedLibModule} from '@shared-lib/shared-lib.module';
import {DashboardComponent} from '@global-app/utils/components/dashboard/dashboard.component';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CaseConversionInterceptor} from '@shared-lib/interceptors/case-conversion.interceptor';
import {LoadingInterceptor} from '@shared-lib/interceptors/loading.interceptor';
import {KeycloakAngularModule, KeycloakService} from "keycloak-angular";
import {AuthInterceptor, initializeKeycloak} from "@shared-lib/services/keycloak";
//import {initSentry} from "@shared-lib/services/sentry.config";
//import * as Sentry from '@sentry/angular';

//initSentry();

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedLibModule,
    BrowserModule,
    BrowserAnimationsModule,
    KeycloakAngularModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CaseConversionInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    /*{
      provide: ErrorHandler,
      useFactory: () => Sentry.createErrorHandler({
        showDialog: false,
      }),
    },*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
