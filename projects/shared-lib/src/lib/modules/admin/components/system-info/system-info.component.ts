import {booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID} from '@angular/core';
import {formatNumber} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {SystemComputingInfoDTO, SystemComputingInfoReducedDTO} from '../../dto/system-info';

type LoadLevel = 'ok' | 'warn' | 'critical';

interface ResourceTile {
  key: string;
  icon: string;
  label: string;
  name: string;
  specs: string[];
  usage: {
    percent: number;
    level: LoadLevel;
    used: string;
    free: string;
  } | null;
}

const WARN_PERCENT = 75;
const CRITICAL_PERCENT = 90;

@Component({
  selector: 'lib-system-info',
  imports: [MatIcon, MatTooltip],
  templateUrl: './system-info.component.html',
  styleUrl: './system-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemInfoComponent {
  private readonly locale = inject(LOCALE_ID);

  info = input<SystemComputingInfoReducedDTO | null>();
  runtime = input<SystemComputingInfoDTO | null>();
  /** One row per resource instead of tiles, for narrow containers. */
  compact = input(false, {transform: booleanAttribute});

  readonly tiles = computed<ResourceTile[]>(() => {
    const info = this.info();
    if (!info) return [];
    const runtime = this.runtime();
    const tiles: ResourceTile[] = [];

    const cpu = info.cpuDetails;
    if (cpu) {
      const usage = runtime?.cpuDetails;
      const hasUsage = usage?.usedCores != null && usage?.freeCores != null;
      const percent = hasUsage ? usage!.usagePercent ?? this.percent(usage!.usedCores, cpu.logicalCores) : 0;
      tiles.push({
        key: 'cpu',
        icon: 'memory',
        label: 'CPU',
        name: cpu.modelName || 'Unknown model',
        specs: [`${cpu.logicalCores} threads`, cpu.architecture].filter(Boolean),
        usage: hasUsage ? {
          percent,
          level: this.level(percent),
          used: `${this.fmt(usage!.usedCores, 2)} of ${cpu.logicalCores} cores used`,
          free: `${this.fmt(usage!.freeCores, 2)} free`,
        } : null,
      });
    }

    const ram = info.ramDetails;
    if (ram) {
      const usage = runtime?.ramDetails;
      const hasUsage = usage?.usedMemoryGb != null && usage?.availableMemoryGb != null;
      const percent = hasUsage ? this.percent(usage!.usedMemoryGb, ram.totalMemoryGb) : 0;
      tiles.push({
        key: 'ram',
        icon: 'memory_alt',
        label: 'Memory',
        name: `${this.fmt(ram.totalMemoryGb, 1)} GiB`,
        specs: ['total'],
        usage: hasUsage ? {
          percent,
          level: this.level(percent),
          used: `${this.fmt(usage!.usedMemoryGb, 1)} GiB used`,
          free: `${this.fmt(usage!.availableMemoryGb, 1)} GiB free`,
        } : null,
      });
    }

    (info.gpuHardwareInfo ?? []).forEach((gpu, i) => {
      const usage = runtime?.gpuHardwareInfo?.[i];
      const compute = usage ? parseFloat(usage.computeUtilization) : NaN;
      const usedMemory = usage ? parseFloat(usage.usedMemory) : NaN;
      const totalMemory = parseFloat(gpu.totalMemory);
      tiles.push({
        key: `gpu-${i}`,
        icon: 'developer_board',
        label: (info.gpuHardwareInfo?.length ?? 0) > 1 ? `GPU ${i}` : 'GPU',
        name: gpu.name,
        specs: [gpu.totalMemory, usage?.driverVersion ? `Driver ${usage.driverVersion}` : ''].filter(Boolean),
        usage: Number.isFinite(compute) ? {
          percent: compute,
          level: this.level(compute),
          used: `${this.fmt(compute, 0)} % compute`,
          free: Number.isFinite(usedMemory) && Number.isFinite(totalMemory)
            ? `${this.fmt(this.percent(usedMemory, totalMemory), 0)} % memory`
            : (usage?.usedMemory ?? ''),
        } : null,
      });
    });

    return tiles;
  });

  readonly hasGpu = computed(() => (this.info()?.gpuHardwareInfo?.length ?? 0) > 0);

  private percent(used: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, used / total * 100)) : 0;
  }

  private level(percent: number): LoadLevel {
    if (percent >= CRITICAL_PERCENT) return 'critical';
    if (percent >= WARN_PERCENT) return 'warn';
    return 'ok';
  }

  private fmt(value: number, maxDigits: number): string {
    return formatNumber(value, this.locale, `1.0-${maxDigits}`);
  }
}
