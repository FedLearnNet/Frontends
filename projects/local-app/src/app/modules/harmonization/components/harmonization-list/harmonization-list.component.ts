import {Component, inject, OnInit, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {MatTableModule} from '@angular/material/table';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {HarmonizationDTO} from '../../dto/harmonization';
import {HarmonizationService} from '../../services/harmonization.service';

@Component({
  selector: 'app-harmonization-list',
  templateUrl: './harmonization-list.component.html',
  styleUrl: './harmonization-list.component.scss',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    MatTableModule,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    BtnComponent,
  ],
})
export class HarmonizationListComponent implements OnInit {
  private readonly service = inject(HarmonizationService);

  readonly harmonizations = signal<HarmonizationDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<object | string | null>(null);
  readonly columns = ['name', 'targets', 'updatedAt'];

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: harmonizations => this.harmonizations.set(harmonizations),
      error: error => this.error.set(error),
    });
  }
}
