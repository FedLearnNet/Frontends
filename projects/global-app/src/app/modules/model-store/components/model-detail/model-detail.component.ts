import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CommonModule, Location} from '@angular/common';
import {FormBuilder} from '@angular/forms';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {LARGE} from '@shared-lib/constants';
import {ModelDetailDto, ModelDto, ModelVersionDto} from "@global-app/model-store/dto/model";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTabGroup, MatTabsModule} from "@angular/material/tabs";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {ModelService} from "@global-app/model-store/services/model.service";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {AppTagComponent} from "@global-app/app-store/components/app-tag/app-tag.component";
import {MarkdownComponent} from "ngx-markdown";
import {
  ModelDetailAccessComponent
} from "@global-app/model-store/components/model-detail-access/model-detail-access.component";
import {UserLinkComponent} from "../../../user/components/user-link/user-link.component";
import {AppStoreModule} from "@global-app/app-store/app-store.module";
import {PredictionListComponent} from "@global-app/model-store/components/prediction-list/prediction-list.component";
import {
  ModelVersionListComponent
} from "@global-app/model-store/components/model-version-list/model-version-list.component";
import {MatDialog} from "@angular/material/dialog";
import {PredictionNewComponent} from "@global-app/model-store/components/prediction-new/prediction-new.component";
import {
  ModelVersionDetailComponent
} from "@global-app/model-store/components/model-version-detail/model-version-detail.component";
import {AppHeaderComponent} from "@global-app/app-store/components/app-header/app-header.component";
import {ModelHeaderComponent} from "@global-app/model-store/components/model-header/model-header.component";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";

@Component({
  selector: 'app-model-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    SharedLibModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    AppTagComponent,
    MarkdownComponent,
    ModelDetailAccessComponent,
    UserLinkComponent,
    AppStoreModule,
    PredictionListComponent,
    ModelVersionListComponent,
    AppHeaderComponent,
    ModelHeaderComponent
  ],
  templateUrl: './model-detail.component.html',
  styleUrl: './model-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelDetailComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly modelService: ModelService = inject(ModelService);
  private readonly location: Location = inject(Location);

  model: ModelDetailDto;


  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({model}) => {
      this.model = model;
      this.cdr.detectChanges();
    });
  }

  onGoBack(): void {
    this.location.back();
  }

  newPrediction(): void {
    this.dialog.open(PredictionNewComponent, {
      data: this.model,
      width: '600px',
    })
  }


  versionChanged(version: ModelVersionDto): void {
    if (!this.model) {
      return;
    }
    this.model.lastVersion = version;
    this.cdr.detectChanges();
  }


}
