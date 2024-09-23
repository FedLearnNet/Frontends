import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { SharedLibModule } from '@shared-lib/shared-lib.module';
import { DashboardComponent } from '@global-app/utils/components/dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CaseConversionInterceptor } from '@shared-lib/interceptors/case-conversion.interceptor';
import { LoadingInterceptor } from '@shared-lib/interceptors/loading.interceptor';

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
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
