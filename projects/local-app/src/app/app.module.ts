import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { SharedLibModule } from '@shared-lib/shared-lib.module';
import { DashboardComponent } from './utils/components/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

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
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
