import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {InfoDTO} from '@shared-lib/modules/admin/dto/orch';

type Item = { label: string; value: unknown };
type Section = { title: string; items: Item[] };

@Component({
  selector: 'lib-admin-docker-kpis',
  imports: [],
  templateUrl: './admin-docker-kpis.component.html',
  styleUrl: './admin-docker-kpis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDockerKpisComponent {
  info = input.required<InfoDTO>();

  sections = computed<Section[]>(() => {
    const info = this.info();
    return [
      {
        title: 'System overview',
        items: [
          {label: 'Docker version', value: info.ServerVersion ?? '—'},
          {label: 'Operating system', value: info.OperatingSystem ?? '—'},
          {label: 'OS type', value: info.OSType ?? '—'},
          {label: 'Kernel version', value: info.KernelVersion ?? '—'},
          {label: 'Architecture', value: info.Architecture ?? '—'},
          {label: 'Host name', value: info.Name ?? '—'},
          {label: 'System time', value: info.SystemTime ?? '—'},
        ],
      },
      {
        title: 'Hardware & limits',
        items: [
          {label: 'CPU cores', value: info.NCPU ?? '—'},
          {label: 'Total memory', value: this.toGiB(info.MemTotal)},
          {label: 'Memory limit', value: this.yesNo(info.MemoryLimit)},
          {label: 'Swap limit', value: this.yesNo(info.SwapLimit)},
          {label: 'OOM kill disable', value: this.yesNo(info.OomKillDisable)},
          {label: 'Goroutines', value: info.NGoroutines ?? '—'},
          {label: 'File descriptors', value: info.NFd ?? '—'},
        ],
      },
      {
        title: 'Containers & images',
        items: [
          {label: 'Running containers', value: info.ContainersRunning ?? 0},
          {label: 'Paused containers', value: info.ContainersPaused ?? 0},
          {label: 'Stopped containers', value: info.ContainersStopped ?? 0},
          {label: 'Total containers', value: info.Containers ?? 0},
          {label: 'Images', value: info.Images ?? 0},
        ],
      },
      {
        title: 'Security & runtime',
        items: [
          {label: 'Security options', value: this.join(info.SecurityOptions)},
          {label: 'Isolation mode', value: info.Isolation ?? '—'},
          {label: 'Runtimes', value: this.keys(info.Runtimes)},
        ],
      },
      {
        title: 'Networking & proxies',
        items: [
          {label: 'IPv4 forwarding', value: this.yesNo(info.IPv4Forwarding)},
          {label: 'HTTP proxy', value: info.HttpProxy ?? '—'},
          {label: 'HTTPS proxy', value: info.HttpsProxy ?? '—'},
          {label: 'No proxy', value: info.NoProxy ?? '—'},
        ],
      },
      {
        title: 'Storage & drivers',
        items: [
          {label: 'Docker root dir', value: info.DockerRootDir ?? '—'},
          {label: 'Storage driver', value: info.Driver ?? '—'},
          {label: 'Logging driver', value: info.LoggingDriver ?? '—'},
          {label: 'Driver status', value: info.DriverStatus && info.DriverStatus.length ? info.DriverStatus : []},
        ],
      },
      {
        title: 'Registry & plugins',
        items: [
          {label: 'Registry address', value: info.IndexServerAddress ?? '—'},
          {label: 'Insecure registries', value: this.join(info.RegistryConfig?.InsecureRegistryCIDRs ?? [])},
          {label: 'Auth plugins', value: this.join(info.Plugins?.Authorization ?? null)},
          {label: 'Volume plugins', value: this.join(info.Plugins?.Volume ?? null)},
          {label: 'Log plugins', value: this.join(info.Plugins?.Log ?? null)},
          {label: 'Network plugins', value: this.join(info.Plugins?.Network ?? null)},
        ],
      },
    ];
  });

  private toGiB(bytes?: number): string {
    return typeof bytes === 'number' ? `${(bytes / (1024 ** 3)).toFixed(1)} GB` : '—';
  }

  private yesNo(value?: boolean): string {
    return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '—';
  }

  private join(values?: string[] | null): string {
    return Array.isArray(values) && values.length ? values.join(', ') : '—';
  }

  private keys(values?: Record<string, unknown>): string {
    return values ? Object.keys(values).join(', ') : '—';
  }

  isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  isArrayArray(value: unknown): value is unknown[][] {
    return Array.isArray(value) && value.length > 0 && Array.isArray(value[0]);
  }
}
