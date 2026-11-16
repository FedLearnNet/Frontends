import {TestBed} from '@angular/core/testing';

import {SPINNER_SHOW_DELAY_MS, SpinnerService} from './spinner.service';

describe('SpinnerService', () => {
  let service: SpinnerService;
  let loading: boolean[];

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpinnerService);
    loading = [];
    service.loadingObservable$.subscribe(value => loading.push(value));
  });

  afterEach(() => jasmine.clock().uninstall());

  it('shows after the delay while a request is open', () => {
    service.start();
    jasmine.clock().tick(SPINNER_SHOW_DELAY_MS - 1);
    expect(loading).toEqual([false]);

    jasmine.clock().tick(1);
    expect(loading).toEqual([false, true]);

    service.end();
    expect(loading).toEqual([false, true, false]);
  });

  it('never shows for a short request', () => {
    service.start();
    jasmine.clock().tick(SPINNER_SHOW_DELAY_MS / 2);
    service.end();
    jasmine.clock().tick(SPINNER_SHOW_DELAY_MS);

    expect(loading).toEqual([false]);
  });

  it('stays shown until the last of overlapping requests ended', () => {
    service.start();
    service.start();
    jasmine.clock().tick(SPINNER_SHOW_DELAY_MS);

    service.end();
    expect(loading).toEqual([false, true]);

    service.end();
    expect(loading).toEqual([false, true, false]);
  });

  it('ignores an end without a start', () => {
    service.end();
    service.start();
    jasmine.clock().tick(SPINNER_SHOW_DELAY_MS);

    expect(loading).toEqual([false, true]);
  });
});
