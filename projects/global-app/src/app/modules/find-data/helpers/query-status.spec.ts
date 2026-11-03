import {queryStatus, queryStatusColor} from '@global-app/find-data/helpers/query-status';

describe('query status', () => {
  it('maps the four backend states', () => {
    expect(queryStatus({hasFired: false, hasResult: false})).toBe('draft');
    expect(queryStatus({hasFired: true, hasResult: false, error: ''})).toBe('pending');
    expect(queryStatus({hasFired: true, hasResult: false, error: null})).toBe('pending');
    expect(queryStatus({hasFired: true, hasResult: true})).toBe('finished');
    expect(queryStatus({hasFired: true, hasResult: false, error: 'timed out'})).toBe('failed');
  });

  it('lets a set error win over a result', () => {
    expect(queryStatus({hasFired: true, hasResult: true, error: 'partial failure'})).toBe('failed');
    expect(queryStatusColor({hasFired: true, hasResult: false, error: 'timed out'})).toBe('RED');
    expect(queryStatusColor({hasFired: true, hasResult: false})).toBe('BLUE');
    expect(queryStatusColor({hasFired: true, hasResult: true})).toBe('GREEN');
    expect(queryStatusColor({hasFired: false, hasResult: false})).toBe('GRAY');
  });
});
