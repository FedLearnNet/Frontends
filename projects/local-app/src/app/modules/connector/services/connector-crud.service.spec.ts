import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {TranslateService} from '@ngx-translate/core';
import {ConnectorService} from './connector-crud.service';
import {ConnectorDTO} from '../dto/connector';

describe('ConnectorService', () => {
  it('includes pivot configuration in save requests', () => {
    const apiService = jasmine.createSpyObj<ApiService>('ApiService', ['post']);
    apiService.post.and.returnValue(of({} as ConnectorDTO));

    TestBed.configureTestingModule({
      providers: [
        ConnectorService,
        {provide: ApiService, useValue: apiService},
        {
          provide: ApiErrorSnackbarService,
          useValue: jasmine.createSpyObj<ApiErrorSnackbarService>('ApiErrorSnackbarService', ['showSnackBar'])
        },
        {provide: TranslateService, useValue: {instant: (key: string) => key}}
      ]
    });

    const config = {
      cohortId: 7,
      pivotConfig: {valueColumnIndex: {'patients.csv': 2}}
    } as unknown as ConnectorDTO;

    TestBed.inject(ConnectorService).save(config).subscribe();

    const body = apiService.post.calls.mostRecent().args[1] as ConnectorDTO;
    expect(body.pivotConfig).toEqual(config.pivotConfig);
  });
});
