import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Clipboard} from '@angular/cdk/clipboard';
import {catchError, of} from 'rxjs';
import {KeyValuePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {QueryService} from '@global-app/find-data/services/query.service';
import {TreSourceDto, TreTestDataFileDto} from '@shared-lib/modules/workflow/dto/tre-source';
import {environment} from '@global-app/env/environment';

interface SeedFormat {
  label: string;
  extension: string;
  load: string;
}

const FORMATS: Record<string, SeedFormat> = {
  NEO4J: {label: 'Neo4j', extension: 'cypher', load: 'cypher-shell -u neo4j -p <password> -f test-data.cypher'},
  POSTGRES: {label: 'PostgreSQL', extension: 'sql', load: 'psql -U postgres -d <database> -f test-data.sql'},
  MYSQL: {label: 'MySQL', extension: 'sql', load: 'mysql -u root -p <database> < test-data.sql'},
  MONGODB: {label: 'MongoDB', extension: 'js', load: 'mongosh <database> test-data.js'},
};

@Component({
  selector: 'app-tre-source-data',
  imports: [KeyValuePipe, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './tre-source-data.component.html',
  styleUrl: './tre-source-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreSourceDataComponent {
  private readonly clipboard = inject(Clipboard);
  readonly source = input.required<TreSourceDto>();

  private readonly live = toSignal(inject(QueryService).getTreSources().pipe(catchError(() => of(null))),
    {initialValue: null});
  readonly current = computed(() => this.live()?.find(source => source.id === this.source().id) ?? this.source());
  readonly online = computed(() => !!this.live()?.some(source => source.id === this.source().id));
  readonly format = computed<SeedFormat>(() =>
    FORMATS[this.current().type ?? ''] ?? {
      label: 'database',
      extension: 'txt',
      load: 'Load test-data.txt into a database of the same type'
    });
  readonly loadCommand = computed(() => {
    const file = this.current().testDataFile?.fileName;
    const format = this.format();
    if (!file) {
      return this.link() ? null : format.load;
    }
    return file.endsWith('.' + format.extension) ? format.load.replace(/test-data\.\w+/, file) : null;
  });
  readonly link = computed(() => {
    const text = this.current().testData?.trim() ?? '';
    return /^https?:\/\/\S+$/.test(text) ? text : null;
  });
  readonly env = computed(() => ['FLNET_DB_TYPE', 'FLNET_DB_HOST', 'FLNET_DB_PORT', 'FLNET_DB_NAME', 'FLNET_DB_USER',
    'FLNET_DB_PASSWORD']);
  readonly copied = signal(false);

  fileUrl(file: TreTestDataFileDto): string {
    return `${environment.globalLearningApiUrl}/files/${file.id}/download?secret=${encodeURIComponent(file.secret)}`;
  }

  sizeOf(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  copy(): void {
    this.clipboard.copy(this.current().testData ?? '');
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  download(): void {
    const url = URL.createObjectURL(new Blob([this.current().testData ?? ''], {type: 'text/plain'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-data.${this.format().extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
