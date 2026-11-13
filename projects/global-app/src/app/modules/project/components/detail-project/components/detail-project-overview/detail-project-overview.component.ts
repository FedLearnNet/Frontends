import {Component, effect, inject, input, signal, ChangeDetectionStrategy} from '@angular/core';
import {ProjectDto} from '../../../../dto/project';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {SelectQueryComponent} from '@global-app/find-data/components/select-query/select-query.component';
import {Store} from '@ngrx/store';
import {Actions} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {UnsavedChangesService} from '@shared-lib/services/unsaved-changes.service';
import {dispatchAndAwait} from '@shared-lib/utils/dispatch-and-await';
import {ProjectActions} from '@global-app/project/store/project.actions';
import {MatCard, MatCardAvatar, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-detail-project-overview',
  templateUrl: './detail-project-overview.component.html',
  styleUrl: './detail-project-overview.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatIcon,
    MatButtonModule,
    TranslatePipe,
    MatDivider,
    SelectQueryComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardAvatar,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class DetailProjectOverviewComponent {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  readonly project = input.required<ProjectDto>();

  readonly name = new FormControl('', {nonNullable: true, validators: [Validators.required]});
  readonly description = new FormControl('', {nonNullable: true, validators: [Validators.required]});

  readonly queryId = signal<number | undefined>(undefined);
  readonly editModeName = signal(false);
  readonly editModeDescription = signal(false);

  readonly hasUnsavedChanges = (): boolean => {
    const p = this.project();
    return this.name.value !== (p.name ?? '')
      || this.description.value !== (p.description ?? '')
      || this.queryId() !== p.queryId;
  };

  private readonly unsavedChanges = inject(UnsavedChangesService).register({
    hasUnsavedChanges: this.hasUnsavedChanges,
    save: () => this.saveAll(),
  });

  private saveAll(): Observable<boolean> {
    if (this.name.invalid || this.description.invalid) {
      return of(false);
    }
    const p = this.project();
    const changes: Partial<ProjectDto> = {name: this.name.value, description: this.description.value};
    if (this.queryId() !== p.queryId) {
      changes.queryId = this.queryId();
      changes.exportConfig = p.exportConfig && {...p.exportConfig, features: []};
    }
    return dispatchAndAwait(
      this.store, this.actions$,
      ProjectActions.update({project: {...p, ...changes}}),
      [ProjectActions.updateSuccess], [ProjectActions.updateFailure],
    );
  }

  private formEffect$ = effect(() => {
    const p = this.project();
    if (!p) return;

    this.queryId.set(p.queryId);

    this.name.setValue(p.name ?? '');
    this.name.disable();
    this.editModeName.set(false);

    this.description.setValue(p.description ?? '');
    this.description.disable();
    this.editModeDescription.set(false);
  });


  onEditName(event: MouseEvent): void {
    event.stopPropagation();
    this.editModeName.set(true);
    this.name.enable();
  }

  onSaveName(event: MouseEvent): void {
    if (this.name.invalid) return;
    event.stopPropagation();
    this.editModeName.set(false);
    this.updateProject({ name: this.name.value! });
    this.name.disable();
  }

  onEditDescription(event: MouseEvent): void {
    event.stopPropagation();
    this.editModeDescription.set(true);
    this.description.enable();
  }

  onSaveDescription(event: MouseEvent): void {
    if (this.description.invalid) return;
    event.stopPropagation();
    this.editModeDescription.set(false);
    this.updateProject({ description: this.description.value! });
    this.description.disable();
  }

  setQueryId(queryId: number | undefined): void {
    this.queryId.set(queryId);
  }

  onSaveQuery() {
    const { exportConfig } = this.project();
    this.updateProject({
      queryId: this.queryId(),
      exportConfig: exportConfig && { ...exportConfig, features: [] },
    });
  }

  private updateProject(changes: Partial<ProjectDto>) {
    this.store.dispatch(
      ProjectActions.update({ project: { ...this.project(), ...changes } })
    );
  }
}
