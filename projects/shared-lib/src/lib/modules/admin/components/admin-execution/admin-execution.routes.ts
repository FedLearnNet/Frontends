import {Routes} from '@angular/router';
import {AdminExecutionListComponent} from './admin-execution-list/admin-execution-list.component';
import {AdminExecutionRunComponent} from './admin-execution-run/admin-execution-run.component';
import {AdminExecutionStepComponent} from './admin-execution-step/admin-execution-step.component';
import {AdminExecutionAttemptComponent} from './admin-execution-attempt/admin-execution-attempt.component';

export const ADMIN_EXECUTION_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AdminExecutionListComponent
  },
  {
    path: ':runId',
    data: {breadcrumb: 'Run'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AdminExecutionRunComponent
      },
      {
        path: 'steps/:stepId',
        data: {breadcrumb: 'Step'},
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: AdminExecutionStepComponent
          },
          {
            path: 'attempts/:attemptId',
            data: {breadcrumb: 'Attempt'},
            component: AdminExecutionAttemptComponent
          }
        ]
      }
    ]
  }
];
