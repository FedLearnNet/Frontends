import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {animate, style, transition, trigger} from "@angular/animations";
import {PatientDataTraceabilityLogDto} from "../../../logs/dto/logs";
import {LogService} from "../../../logs/services/log-service";
import {DatePipe} from "@angular/common";
import {
  PatientUpdateLogDetailComponent
} from "../../../logs/components/patient-update-log-detail/patient-update-log-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {PatientDto} from "../../dto/patient";
import {AuditFieldEnum} from "../../../logs/services/log-service-filter-dto";

@Component({
  selector: 'app-patient-log-traceability',
  imports: [
    MatProgressBar,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    DatePipe,
    ErrorCardComponent
  ],
  templateUrl: './patient-log-traceability.component.html',
  styleUrl: './patient-log-traceability.component.scss',
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
export class PatientLogTraceabilityComponent implements OnInit {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);

  patient = input.required<PatientDto>();

  items = signal<PatientDataTraceabilityLogDto[]>([]);
  loading = signal<boolean>(true);
  totalCount = signal<number | undefined>(undefined);
  hasMore = signal<boolean>(false);

  ngOnInit(): void {
    this.logService.getPatientDataTraceabilityLog(
      0,
      25,
      AuditFieldEnum.REVISION_TIMESTAMP,
      "desc",
      this.patient().cohortId,
      undefined,
      undefined,
      this.patient().externalPatientId).subscribe(l => {
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

  loadMore(): void {
  }

  openDetail(log: PatientDataTraceabilityLogDto) {
    this.dialog.open(PatientUpdateLogDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {
        ...log,
        cohortId: log.cohortId ?? this.patient().cohortId,
      }
    });
  }
}
