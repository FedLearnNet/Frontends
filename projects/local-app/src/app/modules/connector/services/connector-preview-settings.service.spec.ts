import {TestBed} from '@angular/core/testing';
import {ConnectorPreviewSettingsService, DEFAULT_PREVIEW_ROWS} from './connector-preview-settings.service';

describe('ConnectorPreviewSettingsService', () => {
  let service: ConnectorPreviewSettingsService;

  beforeEach(() => {
    service = TestBed.inject(ConnectorPreviewSettingsService);
  });

  it('starts with ten rows in file order and sends nothing for them', () => {
    expect(service.rows()).toBe(DEFAULT_PREVIEW_ROWS);
    expect(service.preferNonEmpty()).toBeFalse();
    expect(service.isDefault()).toBeTrue();
    expect(service.toDto()).toEqual({});
  });

  it('sends only the settings that differ from the defaults', () => {
    service.rows.set(50);
    expect(service.toDto()).toEqual({previewRows: 50});

    service.rows.set(DEFAULT_PREVIEW_ROWS);
    service.preferNonEmpty.set(true);
    expect(service.toDto()).toEqual({previewNonEmpty: true});
    expect(service.isDefault()).toBeFalse();
  });

  it('resets to the defaults', () => {
    service.rows.set(100);
    service.preferNonEmpty.set(true);

    service.reset();

    expect(service.isDefault()).toBeTrue();
  });
});
