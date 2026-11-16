import {Injectable, signal} from '@angular/core';

export const DEFAULT_PREVIEW_ROWS = 10;
export const PREVIEW_ROW_OPTIONS = [10, 25, 50, 100] as const;

export interface PreviewSettingsDTO {
  previewRows?: number;
  previewNonEmpty?: boolean;
}

/**
 * How the connector wizard's preview grids show data: how many rows, and whether to prefer rows
 * that have values. Shared by the "Specify headers" and transformation grids, reset when the wizard
 * opens, and never saved with the connector.
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectorPreviewSettingsService {
  readonly rows = signal<number>(DEFAULT_PREVIEW_ROWS);
  readonly preferNonEmpty = signal<boolean>(false);

  reset(): void {
    this.rows.set(DEFAULT_PREVIEW_ROWS);
    this.preferNonEmpty.set(false);
  }

  isDefault(): boolean {
    return this.rows() === DEFAULT_PREVIEW_ROWS && !this.preferNonEmpty();
  }

  /** Only the settings that differ from the defaults, so default requests stay exactly as before. */
  toDto(): PreviewSettingsDTO {
    const dto: PreviewSettingsDTO = {};
    if (this.rows() !== DEFAULT_PREVIEW_ROWS) {
      dto.previewRows = this.rows();
    }
    if (this.preferNonEmpty()) {
      dto.previewNonEmpty = true;
    }
    return dto;
  }
}
