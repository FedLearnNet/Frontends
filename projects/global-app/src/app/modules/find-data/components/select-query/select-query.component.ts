import {ChangeDetectionStrategy, Component, inject, model, output, signal} from '@angular/core';
import {QueryService} from "@global-app/find-data/services/query.service";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TranslatePipe} from "@ngx-translate/core";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {catchError, of, switchMap} from 'rxjs';
import {QueryPartnerSystemDTO} from '@shared-lib/modules/admin/dto/system-info';

@Component({
  selector: 'app-select-query',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    MatTooltipModule,
  ],
  templateUrl: './select-query.component.html',
  styleUrl: './select-query.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectQueryComponent {
  private readonly queryService: QueryService = inject(QueryService);

  queryId = model<number | undefined>(undefined);
  readonly systems = toSignal(toObservable(this.queryId).pipe(
    switchMap(id => id ? this.queryService.getSystems(id).pipe(catchError(() => of([]))) : of([]))), {initialValue: []});
  queryIdSave = output();

  queryList = toSignal(this.queryService.getAllQueries());
  readonly editMode = signal(false);


  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editMode.set(true);
  }

  onSave(event: MouseEvent): void {
    event.stopPropagation();
    this.editMode.set(false);
    this.queryIdSave.emit();
  }


  // one line per client; the platform sends the hardware only of clients with TRE
  hardwareOf(partner: QueryPartnerSystemDTO): { icon: string; text: string; detail?: string }[] | null {
    const system = partner.system;
    if (!system) {
      return null;
    }
    const gpus = system.gpuHardwareInfo ?? [];
    return [
      system.cpuDetails && {icon: 'memory', text: `${system.cpuDetails.logicalCores} threads`, detail: system.cpuDetails.modelName},
      system.ramDetails && {icon: 'memory_alt', text: `${Math.round(system.ramDetails.totalMemoryGb)} GB RAM`},
      gpus.length
        ? {icon: 'developer_board', text: `${gpus.length} GPU · ${gpus[0].totalMemory}`, detail: gpus.map(gpu => gpu.name).join(', ')}
        : {icon: 'developer_board_off', text: 'No GPU'},
    ].filter((item): item is { icon: string; text: string; detail?: string } => !!item);
  }
}
