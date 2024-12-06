import {Component, inject} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ProjectService} from "@global-app/project/services/project-service";

@Component({
  selector: 'app-join-project',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,],
  templateUrl: './join-project.component.html',
  styleUrl: './join-project.component.scss'
})
export class JoinProjectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<JoinProjectDialogComponent>);
  readonly projectService: ProjectService = inject(ProjectService);

  public token: string;

  onNoClick(): void {
    this.dialogRef.close();
  }

  joinProject(): void {
    this.projectService.joinProject(this.token).subscribe(() => {
      this.dialogRef.close();
    });
  }


}
