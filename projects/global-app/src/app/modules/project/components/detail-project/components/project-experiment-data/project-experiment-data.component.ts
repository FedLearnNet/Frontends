import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {Store} from "@ngrx/store";
import {MatIcon} from "@angular/material/icon";
import {ProjectDto} from "@global-app/project/dto/project";
import {FileCardComponent} from "@shared-lib/modules/files/components/file-card/file-card.component";
import {
  UploadFileAreaComponent
} from "@shared-lib/modules/files/components/upload-file-area/upload-file-area.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {ProjectActions} from "@global-app/project/store/project.actions";
import {selectCurrentUpload, selectError} from "@global-app/project/store/project.selectors";

@Component({
  selector: 'app-project-local-experiment-data',
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    FileCardComponent,
    UploadFileAreaComponent,
    ErrorCardComponent
  ],
  templateUrl: './project-experiment-data.component.html',
  styleUrl: './project-experiment-data.component.scss'
})
export class ProjectExperimentDataComponent {
  private readonly store: Store = inject(Store);

  project = input.required<ProjectDto>();
  currentUpload = this.store.selectSignal(selectCurrentUpload);
  error = this.store.selectSignal(selectError);

  file = computed(() => {
    if(this.currentUpload()){
      return this.currentUpload()?.result;
    }
    return this.project().file;
  });
  showUpload = signal<boolean>(false);

  showInitUpload$ = effect(() => {
    const file = this.file();
    if (!file) {
      this.showUpload.set(true);
    }else{
      this.showUpload.set(false);
    }
  });

  toggleUpload(): void {
    this.showUpload.update(u => !u);
  }


  uploadFile(file: File): void {
    this.store.dispatch(ProjectActions.uploadFile({projectId: this.project().id, file}));
  }
}
