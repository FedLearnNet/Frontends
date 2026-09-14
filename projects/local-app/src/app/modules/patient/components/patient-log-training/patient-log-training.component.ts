import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {DatePipe} from "@angular/common";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatProgressBar} from "@angular/material/progress-bar";
import {animate, style, transition, trigger} from "@angular/animations";
import {LogService} from "../../../logs/services/log-service";
import {PatientLearningDto} from "@local-app/data-review/dto/federated-learning-request";
import {PatientDto} from "../../dto/patient";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-patient-log-training',
  imports: [
    DatePipe,
    ErrorCardComponent,
    MatProgressBar,
    RouterLink
  ],
  templateUrl: './patient-log-training.component.html',
  styleUrl: './patient-log-training.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('rowIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(4px)'}),
        animate('140ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class PatientLogTrainingComponent implements OnInit {
  private readonly logService: LogService = inject(LogService);

  patient = input.required<PatientDto>();

  items = signal<PatientLearningDto[]>([]);
  loading = signal<boolean>(true);
  totalCount = signal<number | undefined>(undefined);
  hasMore = signal<boolean>(false);

  ngOnInit(): void {
    this.logService.getPatientDataLearningLog({
      patientId: this.patient().id,
    }).subscribe(l => {
      this.loading.set(false);
      this.totalCount.set(l.totalCount);
      this.items.update(values => {
        return [...values, ...l.results];
      });
      if (l.totalCount > this.items().length) {
        this.hasMore.set(true);
      } else {
        this.hasMore.set(false);
      }
    })
  }

  get error() {
    return "";
  }
}
