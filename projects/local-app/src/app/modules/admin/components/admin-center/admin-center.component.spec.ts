import { ComponentFixture, TestBed } from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';

import { AdminCenterComponent } from './admin-center.component';
import {GlobalAuthService} from '../../service/global-auth.service';
import {LocalApiHealthService} from '../../service/health.service';

describe('AdminCenterComponent', () => {
  let component: AdminCenterComponent;
  let fixture: ComponentFixture<AdminCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminCenterComponent,
        NoopAnimationsModule,
      ],
      providers: [
        provideRouter([]),
        {
          provide: GlobalAuthService,
          useValue: {
            login: () => of(undefined),
            clearLogin: () => of(undefined),
          },
        },
        {
          provide: LocalApiHealthService,
          useValue: {
            streamBoxes: () => of([
              {
                key: 'api',
                title: 'API',
                reachable: 'UP',
                items: [{label: 'WebSocket connected', status: 'UP'}],
              },
            ]),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
