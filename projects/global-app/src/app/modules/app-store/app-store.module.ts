import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppStoreRoutingModule} from "./app-store-routing.module";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {AppCardMiniComponent} from "./components/app-card-mini/app-card-mini.component";
import {MatChipsModule} from "@angular/material/chips";
import {AppListComponent} from "./components/app-list/app-list.component";
import {AppCardComponent} from "./components/app-card/app-card.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatRadioModule} from "@angular/material/radio";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSidenavModule} from "@angular/material/sidenav";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDividerModule} from "@angular/material/divider";
import {AppTagComponent} from "./components/app-tag/app-tag.component";
import {MatTooltipModule} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    AppCardMiniComponent,
    AppListComponent,
    AppCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    AppStoreRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatRadioModule,
    MatSidenavModule,
    MatDividerModule,
    AppTagComponent
  ],
    exports: [
        AppCardMiniComponent,
        AppListComponent,
        AppCardComponent,
    ]
})
export class AppStoreModule { }
