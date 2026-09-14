import {Component, inject, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LARGE, MEDIUM, SMALL, XLARGE, XSMALL} from '@shared-lib/constants';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {ActivatedRoute} from '@angular/router';
import {
  CohortCreateDialogComponent
} from "@local-app/cohort/components/cohort-create-dialog/cohort-create-dialog.component";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";
import {NgClass, UpperCasePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {MatButtonModule} from "@angular/material/button";
import {SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";

@Component({
  selector: 'app-cohort-create',
  templateUrl: './cohort-create.component.html',
  styleUrl: './cohort-create.component.scss',
  imports: [
    MatGridListModule,
    MatCardModule,
    NgClass,
    TranslatePipe,
    MatButtonModule,
    UpperCasePipe,
  ]
})
export class CohortCreateComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);

  cols: number = 3;
  rowHeight: string = '1:1';
  screenSize: string = LARGE;

  schemaList: SchemaNodeNestedDto[];


  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({schemaHeadList}) => this.schemaList = schemaHeadList);
    this.responsiveService.getScreenSize().subscribe(screenSize => this.screenSize = screenSize);
    this.checkAndAdjustResponsiveLayout();
  }

  openSchemaDetailDialog(schema: SchemaNodeNestedDto, event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(CohortCreateDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {
        schemaId: schema.globalId,
      }
    });
  }

  private checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => {
        this.screenSize = screenSize;
        switch (screenSize) {
          case XLARGE:
            this.cols = 4;
            break;
          case LARGE:
            this.cols = 3;
            break;
          case MEDIUM:
          case SMALL:
            this.cols = 2;
            break;
          case XSMALL:
            this.cols = 1;
            break;
          default:
            this.cols = 2;
        }
      });
  }
}
