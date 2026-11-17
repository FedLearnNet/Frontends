import {Component, inject, OnInit, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {MatTableModule} from '@angular/material/table';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {SseRefreshBtnComponent} from '@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {codeTransformerBadge, CodeTransformerDTO} from '../../dto/code-transformer';
import {ConnectorCodeTransformerService} from '../../services/connector-code-transformer.service';
import {modeIcon, modeLabelKey} from '../manage-connector/components/function/tool-list-item/transformer-mode';

@Component({
  selector: 'app-custom-transformer-list',
  templateUrl: './custom-transformer-list.component.html',
  styleUrl: './custom-transformer-list.component.scss',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    MatTableModule,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    SseRefreshBtnComponent,
    StatusBadgeComponent,
    BadgeComponent,
  ],
})
export class CustomTransformerListComponent implements OnInit {
  private readonly service = inject(ConnectorCodeTransformerService);

  readonly transformers = signal<CodeTransformerDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<object | string | null>(null);
  readonly columns = ['status', 'name', 'mode', 'usages', 'updatedAt'];
  readonly badge = codeTransformerBadge;
  readonly modeIcon = modeIcon;
  readonly modeLabelKey = modeLabelKey;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: transformers => this.transformers.set(transformers),
      error: error => this.error.set(error),
    });
  }
}
