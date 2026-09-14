import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  AdminFLNetClientObserverComponent as SharedComponent
} from '@shared-lib/modules/admin/components/admin-flnet-client-observer/admin-flnet-client-observer.component';

@Component({
  selector: 'app-admin-flnet-client-observer',
  imports: [SharedComponent],
  template: '<lib-admin-flnet-client-observer />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFLNetClientObserverComponent {
}
