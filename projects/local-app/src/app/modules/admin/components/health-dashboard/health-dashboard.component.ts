import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {LocalApiHealthService} from "../../service/health.service";
import {ServiceBox} from "../../model/health.model";
import {MatCard} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {UpDownUnknown} from "../../dto/health";

@Component({
  selector: 'app-health-dashboard',
  imports: [
    MatCard,
    MatIcon,
  ],
  templateUrl: './health-dashboard.component.html',
  styleUrl: './health-dashboard.component.scss'
})
export class HealthDashboardComponent implements OnInit {
  private readonly svc: LocalApiHealthService = inject(LocalApiHealthService);

  loading = signal(true);
  boxes: WritableSignal<ServiceBox[]> = signal<ServiceBox[]>([]);

  ngOnInit() {
    this.svc.streamBoxes().subscribe({
      next: (b) => {
        this.boxes.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  icon(status: UpDownUnknown) {
    if (status === 'UP') return 'check_circle';
    if (status === 'DOWN') return 'error';
    return 'help';
  }

  entries(meta?: Record<string, string | number>): [string, string | number][] {
    return meta ? Object.entries(meta) : [];
  }
}
