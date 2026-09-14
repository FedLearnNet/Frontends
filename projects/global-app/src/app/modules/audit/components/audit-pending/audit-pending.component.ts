import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuditActions} from "../../service/audit.actions";
import {selectAuditError, selectAuditPending, selectAuditPendingLoading} from "../../service/audit.selectors";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'app-audit-pending',
  imports: [
    MatIconButton,
    MatIcon,
    BadgeComponent,
    StoreCardComponent,
    RouterLink,
    HeaderComponent,
    PageWrapperComponent
  ],
  templateUrl: './audit-pending.component.html',
  styleUrl: './audit-pending.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditPendingComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  public pendingAudits = this.store.selectSignal(selectAuditPending);
  loading = this.store.selectSignal(selectAuditPendingLoading);
  error = this.store.selectSignal(selectAuditError);

  pendingCount = computed(() => this.pendingAudits().length);


  refresh(): void {
    this.store.dispatch(AuditActions.loadPending());
  }
}
