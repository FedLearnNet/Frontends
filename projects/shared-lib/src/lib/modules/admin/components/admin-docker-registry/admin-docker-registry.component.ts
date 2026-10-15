import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {finalize} from 'rxjs';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {RegistryImagesDTO} from '@shared-lib/modules/admin/dto/orch';
import {OrchRelayService} from '@shared-lib/modules/admin/services/orch.service';

@Component({
  selector: 'lib-admin-docker-registry',
  imports: [
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressBarModule, MatTableModule, MatTooltipModule, ErrorCardComponent,
  ],
  templateUrl: './admin-docker-registry.component.html',
  styleUrl: './admin-docker-registry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDockerRegistryComponent implements OnInit {
  private readonly orchService = inject(OrchRelayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly registry = signal<RegistryImagesDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<object | null>(null);
  readonly search = signal('');
  readonly images = computed(() => {
    const registry = this.registry();
    return registry?.repositories.flatMap(repository =>
      (repository.tags.length ? repository.tags : [null]).map(tag => ({
        repository: repository.name,
        tag,
        reference: tag ? `${registry.registry}/${repository.name}:${tag}` : null,
      }))
    ) ?? [];
  });
  readonly filteredImages = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.images().filter(image =>
      `${image.repository}:${image.tag ?? ''}`.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.orchService.getRegistryImages().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: registry => this.registry.set(registry),
      error: error => {
        this.registry.set(null);
        this.error.set(error);
      },
    });
  }

  shortTag(tag: string): string {
    return /^[a-f0-9]{40,64}$/i.test(tag) ? tag.slice(0, 8) : tag;
  }

  async copyReference(reference: string): Promise<void> {
    await navigator.clipboard.writeText(reference);
    this.snackBar.open('Image reference copied', 'Close', {duration: 2000});
  }
}
