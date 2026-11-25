import {queryStatus, queryStatusColor} from '@global-app/find-data/helpers/query-status';

describe('query status', () => {
  it('maps the four backend states', () => {
    expect(queryStatus({hasFired: false, hasResult: false})).toBe('draft');
    expect(queryStatus({hasFired: true, hasResult: false})).toBe('pending');
    expect(queryStatus({hasFired: true, hasResult: true, result: 12})).toBe('finished');
    expect(queryStatus({hasFired: true, hasResult: true, result: null})).toBe('failed');
  });

  it('treats any numeric result as success', () => {
    expect(queryStatus({hasFired: true, hasResult: true, result: 0})).toBe('finished');
    expect(queryStatusColor({hasFired: true, hasResult: true, result: 4})).toBe('GREEN');
    expect(queryStatusColor({hasFired: true, hasResult: true, result: null})).toBe('RED');
    expect(queryStatusColor({hasFired: true, hasResult: false})).toBe('BLUE');
    expect(queryStatusColor({hasFired: false, hasResult: false})).toBe('GRAY');
  });
});
