import {Component, computed, effect, ElementRef, input, signal, viewChild} from '@angular/core';
import {RunMessageLogDTO} from "../../dto/log";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatIcon} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatTooltip} from "@angular/material/tooltip";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";

@Component({
  selector: 'lib-run-logs-list',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInput,
    MatButtonToggleModule,
    MatIcon,
    MatChipsModule,
    MatButtonModule,
    MatToolbar,
    MatTooltip,
    StatusBadgeComponent
  ],
  templateUrl: './run-logs-list.component.html',
  styleUrl: './run-logs-list.component.scss'
})
export class RunLogsListComponent {
  logs = input.required<RunMessageLogDTO[]>();
  showBorder = input<boolean>(true);


  private readonly BOTTOM_EPS = 12;
  query = signal<string>('');
  showOnly = signal<'ALL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'>('ALL');
  autoScroll = signal<boolean>(true);
  expandedIds = signal<Set<number>>(new Set());

  containerRef = viewChild<ElementRef<HTMLElement>>('container');


  filtered = computed<RunMessageLogDTO[]>(() => {
    const q = this.query().trim().toLowerCase();
    const level = this.showOnly();
    let items = this.logs();

    if (level !== 'ALL') {
      items = items.filter(m => m.severity === level);
    }
    if (q) {
      items = items.filter(m =>
        (m.message ?? '').toLowerCase().includes(q) ||
        (m.process ?? '').toLowerCase().includes(q) ||
        (m.caller ?? '').toLowerCase().includes(q)
      );
    }
    return items;
  });

  autoScrollFx = effect(() => {
    const _ = this.filtered(); // track changes
    if (!this.autoScroll()) return;
    const el = this.containerRef()?.nativeElement;
    if (!el) return;
    queueMicrotask(() => (el.scrollTop = el.scrollHeight));
  });

  onListScroll() {
    const el = this.containerRef()?.nativeElement;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= this.BOTTOM_EPS;
    if (this.autoScroll() !== atBottom) this.autoScroll.set(atBottom);
  }

  toggleExpand(m: RunMessageLogDTO) {
    const id = m.id ?? -1;
    if (id < 0) return;
    const next = new Set(this.expandedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expandedIds.set(next);
  }

  isExpanded(m: RunMessageLogDTO) {
    const id = m.id ?? -1;
    return this.expandedIds().has(id);
  }


  getType(severity: string): StatusBadeType {
    switch (severity.toLowerCase()) {
      case 'success':
        return "SUCCESS";
      case 'error':
        return "FAILED";
      case 'warn':
        return "WARNING";
      case 'info':
        return "RUNNING";
      default:
        return "PENDING";
    }
  }


  clearFilters() {
    this.query.set('');
    this.showOnly.set('ALL');
  }
}
