import {queryStatus, queryStatusColor} from '@global-app/find-data/helpers/query-status';

describe('query status', () => {
  it('maps the four backend states', () => {
    expect(queryStatus({hasFired: false, hasResult: false})).toBe('draft');
    expect(queryStatus({hasFired: true, hasResult: false, error: ''})).toBe('pending');
    expect(queryStatus({hasFired: true, hasResult: false, error: null})).toBe('pending');
    expect(queryStatus({hasFired: true, hasResult: true, result: 12})).toBe('finished');
    expect(queryStatus({hasFired: true, hasResult: false, error: 'timed out'})).toBe('failed');
  });

  it('treats a numeric result as success and ignores a privacy error', () => {
    expect(queryStatus({hasFired: true, hasResult: true, result: 4, error: 'privacy'})).toBe('finished');
    expect(queryStatus({hasFired: true, hasResult: true, result: 0, error: 'privacy'})).toBe('finished');
    expect(queryStatus({hasFired: true, hasResult: true, result: null, error: 'privacy'})).toBe('failed');
    expect(queryStatus({hasFired: true, hasResult: true, result: null})).toBe('failed');
    expect(queryStatusColor({hasFired: true, hasResult: true, result: 4, error: 'privacy'})).toBe('GREEN');
    expect(queryStatusColor({hasFired: true, hasResult: false, error: 'timed out'})).toBe('RED');
    expect(queryStatusColor({hasFired: true, hasResult: false})).toBe('BLUE');
    expect(queryStatusColor({hasFired: false, hasResult: false})).toBe('GRAY');
  });
});
