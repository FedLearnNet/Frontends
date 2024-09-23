import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {ActivatedRoute, Router} from '@angular/router';
import {isNotEmpty} from '@shared-lib/utils';
import {MatDialog} from '@angular/material/dialog';
import {SchemaListComponent} from '@local-app/cohort/components/schema-list/schema-list.component';
import {isEmpty} from 'lodash';
import {SchemaService} from '@local-app/cohort/services/schema.service';
import {Schema} from '@shared-lib/models';

@Component({
  selector: 'app-cohort-detail',
  templateUrl: './cohort-detail.component.html',
  styleUrl: './cohort-detail.component.scss'
})
export class CohortDetailComponent implements OnInit {
  isCohortEdit: boolean;
  isCohortSubscribed: boolean = false;

  schemaList: Schema[];
  cohortDetailFormGroup: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  @Input() schema: Schema | undefined;

  screenSize: string;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private schemaService: SchemaService,
    private responsiveService: ResponsiveService,
  ) {
  }

  ngOnInit(): void {
    this.isCohortEdit = isNotEmpty(this.activatedRoute.snapshot.params['schema-id']);

    this.activatedRoute.data.subscribe(({schemaHeadList}) => this.schemaList = schemaHeadList);

    this.responsiveService.getScreenSize().subscribe(screenSize => this.screenSize = screenSize);

    this.setSubscribedSchema(this.schema);
  }

  openSchemaListModal(): void {
    const dialogRef = this.dialog.open(SchemaListComponent, {
      minWidth: '80%',
      data: {
        schemaList: this.schemaList
      },
    });

    dialogRef.afterClosed().subscribe((schemaId: string) => {
      if (isEmpty(schemaId)) {
        return;
      }

      this.schemaService.subscribeToSchema({id: schemaId}).subscribe(response => {
        this.router.navigate(['cohort', 'edit', response.uniqueId]);
      }, error => {
        console.log("### subscribeToSchema", error)
      });
    });
  }

  onUpdateCohort(): void {
    this.cohortDetailFormGroup.markAllAsTouched();

    if (this.cohortDetailFormGroup.invalid) {
      return;
    }

    this.schemaService.updateSchema(
      this.activatedRoute.snapshot.params['schema-id'],
      this.cohortDetailFormGroup.getRawValue()
    ).subscribe(response => {
      this.setSubscribedSchema(response);
      location.reload()
    }, error => {
      console.log("### updateSchema", error)
    });
  }

  private setSubscribedSchema(schema: Schema | undefined): void {
    if (!schema) {
      return;
    }

    this.isCohortSubscribed = true;

    this.cohortDetailFormGroup.patchValue({
      name: schema.name,
      description: schema.description,
    });
  }
}
