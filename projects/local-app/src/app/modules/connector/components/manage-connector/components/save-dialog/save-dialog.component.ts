import { Component, OnInit, inject } from '@angular/core';
import { ManageConnectorComponent } from "../../manage-connector.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
    selector: 'app-save-dialog',
    imports: [MatFormFieldModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDividerModule,
        FormsModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatTableModule,
        MatTooltipModule, TranslatePipe,

    ],
    templateUrl: './save-dialog.component.html',
    styleUrl: './save-dialog.component.scss'
})
export class ManageConnectorSaveDialogComponent implements OnInit {
    dialogRef = inject<MatDialogRef<ManageConnectorComponent>>(MatDialogRef);
    data = inject<{
        name: string;
        description: string;
        errorMessage?: string;
    }>(MAT_DIALOG_DATA);
    private fb = inject(FormBuilder);

    form!: FormGroup;
    errorMessage?: string;

    ngOnInit(): void {
        this.form = this.fb.group({
            name: [this.data?.name ?? '', [Validators.required]],
            description: [this.data?.description ?? ''],
        });

        if (this.data?.errorMessage) {
            this.errorMessage = this.data.errorMessage;
        }
    }

    get nameControl() {
        return this.form.get('name');
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.dialogRef.close(this.form.getRawValue() as { name: string, description: string });
    }
}
