import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal} from '@angular/core';
import {ProjectDto} from '../../../../dto/project';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {SelectQueryComponent} from '@global-app/find-data/components/select-query/select-query.component';
import {Store} from '@ngrx/store';
import {ProjectActions} from '@global-app/project/store/project.actions';
import {MatCard, MatCardAvatar, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {ProjectService} from '@global-app/project/services/project-service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-detail-project-overview',
  templateUrl: './detail-project-overview.component.html',
  styleUrl: './detail-project-overview.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
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
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);

  project = input.required<ProjectDto>();

  readonly name = new FormControl('', {nonNullable: true, validators: [Validators.required]});
  readonly description = new FormControl('', {nonNullable: true, validators: [Validators.required]});
  readonly platformIsCoordinator = new FormControl<boolean>(false, {nonNullable: true});

  readonly queryId = signal<number | undefined>(undefined);
  readonly editModeName = signal(false);
  readonly editModeDescription = signal(false);
  readonly editModePlatformIsCoordinator = signal(false);
  readonly platformAggregatorSupported = signal(false);

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

    this.platformIsCoordinator.setValue(p.platformIsCoordinator ?? false);
    this.platformIsCoordinator.disable();
    this.editModePlatformIsCoordinator.set(false);
  });

  constructor() {
    this.projectService.getPlatformAggregatorSupported()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: supported => this.platformAggregatorSupported.set(supported),
        error: () => this.platformAggregatorSupported.set(false),
      });
  }


  onEditName(event: MouseEvent): void {
    event.stopPropagation();
    this.editModeName.set(true);
    this.name.enable();
  }

  onSaveName(event: MouseEvent): void {
    if (this.name.invalid) return;
    event.stopPropagation();
    this.editModeName.set(false);
    this.save();
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
    this.save();
    this.description.disable();
  }

  onEditPlatformIsCoordinator(event: MouseEvent): void {
    event.stopPropagation();
    this.editModePlatformIsCoordinator.set(true);
    this.platformIsCoordinator.enable();
  }

  onSavePlatformIsCoordinator(event: MouseEvent): void {
    event.stopPropagation();
    this.editModePlatformIsCoordinator.set(false);
    this.save();
    this.platformIsCoordinator.disable();
  }

  setQueryId(queryId: number | undefined): void {
    this.queryId.set(queryId);
  }

  save(): void {
    const current = this.project();
    const updated: ProjectDto = {
      ...current,
      name: this.name.value!,
      description: this.description.value!,
      queryId: this.queryId(),
      platformIsCoordinator: this.platformIsCoordinator.value,
    };

    this.store.dispatch(ProjectActions.update({project: updated}));
  }
}
